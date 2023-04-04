import os
import re

import click


def add_include(include_file):
    with open(include_file) as f:
        partial_lines = f.readlines()
        return "".join(partial_lines)


@click.command()
@click.argument(
    "infile",
    type=click.Path(dir_okay=False),
)
@click.argument(
    "partials_dir",
    type=click.Path(dir_okay=True, file_okay=False),
)
@click.option(
    "--outdir",
    type=click.Path(dir_okay=True, file_okay=False),
    default=".",
    help="Directory to save the generated AsciiDoc files to",
)
def main(infile, partials_dir, outdir):
    basename = os.path.basename(infile)
    filename, ext = os.path.splitext(basename)
    outfile = os.path.join(outdir, "".join([filename, "-with-includes", ext]))

    include_pattern = re.compile("include::partial\$(.*)\[\]")

    with open(infile) as f, open(outfile, "w") as fw:
        lines = f.readlines()
        for i, line in enumerate(lines):
            match = re.match(include_pattern, line)
            if match is not None:
                path = os.path.join(partials_dir, re.match(include_pattern, line).group(1))
                lines[i] = add_include(path)

        fw.writelines(lines)


if __name__ == "__main__":
    main()
