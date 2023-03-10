import os
import re

import bs4
import click
import dotenv

CODE_TYPES = {
    "gds-client": ("GDS-client", "python"),
    "cypher": ("Cypher", "cypher"),
    "python-driver": ("Python-driver", "python"),
}


@click.command()
@click.argument(
    "infile",
    type=click.Path(dir_okay=False),
)
@click.option(
    "--outdir",
    type=click.Path(dir_okay=True, file_okay=False),
    default="tests",
    help="Directory to save the extracted code to",
)
@click.option(
    "--code-type",
    default="gds-client",
    type=click.Choice(CODE_TYPES.keys()),
    help="Type of code to extract",
)
@click.option(
    "--aura-env-file",
    default="aura.env",
    type=click.Path(dir_okay=False),
    help="Location of the Aura env file",
)
def main(infile, outdir, code_type, aura_env_file):
    code_name, code_lang = CODE_TYPES[code_type]

    # Assumes a /.../.../<filename>/index.html structure to create a <filename>.py code file
    outname = os.extsep.join([os.path.split(infile)[0].split(os.sep)[-1], "py"])
    outpath = os.path.join(outdir, outname)

    with open(infile) as f, open(outpath, "w") as fw:
        content_html = bs4.BeautifulSoup(f, features="html.parser")
        code_block_selector = f"div .include-with-{code_name} code[data-lang={code_lang}]"

        for el in content_html.select(code_block_selector):
            code = el.text

            if el.find_parent(class_="sect1").find(id="_setup") is not None:
                conn_uri = dotenv.get_key(aura_env_file, "NEO4J_URI")
                username = dotenv.get_key(aura_env_file, "NEO4J_USERNAME")
                pwd = dotenv.get_key(aura_env_file, "NEO4J_PASSWORD")

                code = re.sub(
                    "AURA_CONNECTION_URI = .*",
                    f'AURA_CONNECTION_URI = "{conn_uri}"',
                    code,
                )
                code = re.sub("AURA_USERNAME = .*", f'AURA_USERNAME = "{username}"', code)
                code = re.sub("AURA_PASSWORD = .*", f'AURA_PASSWORD = "{pwd}"', code)

            fw.write(f"{code}\n\n")


if __name__ == "__main__":
    main()
