import json

import click
import dotenv
import polling2

from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session

AURA_API_ENV = "aura_api.env"

CLIENT_ID = dotenv.get_key(AURA_API_ENV, "CLIENT_ID")
CLIENT_SECRET = dotenv.get_key(AURA_API_ENV, "CLIENT_SECRET")
TOKEN_URL = dotenv.get_key(AURA_API_ENV, "TOKEN_URL")
API_BASE_URL = dotenv.get_key(AURA_API_ENV, "API_BASE_URL")


def init_oauth_session():
    client = BackendApplicationClient(client_id=CLIENT_ID)
    oauth_session = OAuth2Session(client=client)

    oauth_session.fetch_token(TOKEN_URL, client_id=CLIENT_ID, client_secret=CLIENT_SECRET)

    return oauth_session


def list_instances(oauth_session):
    res = oauth_session.get(f"{API_BASE_URL}/instances")
    res.raise_for_status()

    print(json.dumps(res.json(), indent=2))


def write_dotenv_file(aura_env_file, instance_data):
    dotenv.set_key(aura_env_file, "NEO4J_URI", instance_data["connection_url"])
    dotenv.set_key(aura_env_file, "NEO4J_USERNAME", instance_data["username"])
    dotenv.set_key(aura_env_file, "NEO4J_PASSWORD", instance_data["password"])
    dotenv.set_key(aura_env_file, "AURA_INSTANCEID", instance_data["id"])


def create_instance(oauth_session, aura_env_file):
    body = {
        "version": "5",
        "region": "europe-west1",
        "memory": "8GB",
        "name": "test",
        "type": "enterprise-ds",
    }
    res = oauth_session.post(f"{API_BASE_URL}/instances", json=body)
    res.raise_for_status()

    instance_data = res.json()["data"]
    write_dotenv_file(aura_env_file, instance_data)

    connection_url = instance_data["connection_url"]
    instance_id = instance_data["id"]

    print(f"Creating instance: {connection_url}")

    def is_instance_running(response):
        return response.json()["data"]["status"] == "running"

    polling2.poll(
        lambda: oauth_session.get(f"{API_BASE_URL}/instances/{instance_id}"),
        check_success=is_instance_running,
        step=10,
        timeout=300,
    )

    print(f"Instance created: {connection_url}")


def destroy_instance(oauth_session, aura_env_file):
    connection_url = dotenv.get_key(aura_env_file, "NEO4J_URI")
    instance_id = dotenv.get_key(aura_env_file, "AURA_INSTANCEID")

    print(f"Destroying instance: {connection_url}")

    res = oauth_session.delete(f"{API_BASE_URL}/instances/{instance_id}")
    res.raise_for_status()


@click.command()
@click.option("--create", default=False, is_flag=True, help="Create an Aura instance")
@click.option("--destroy", default=False, is_flag=True, help="Destroy an Aura instance")
@click.option(
    "--aura-env-file",
    default="aura.env",
    type=click.Path(dir_okay=False),
    help="Location of the Aura env file to create",
)
def main(create, destroy, aura_env_file):
    oauth_session = None

    if create or destroy:
        oauth_session = init_oauth_session()

    if create:
        create_instance(oauth_session, aura_env_file)

    if destroy:
        destroy_instance(oauth_session, aura_env_file)

    if oauth_session is not None:
        oauth_session.close()


if __name__ == "__main__":
    main()
