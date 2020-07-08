#!/usr/bin/env python
# -*- mode: Python; coding: utf-8 -*-

import sys

def styled(block):
  result = ""
  opening = True
  for w in block:
    for c in w:
      if c != u'`':
        result += c
      else:
        if opening:
          result += "<code>"
        else:
          result += "</code>"
        opening = not opening
  return result

title = ''
html_mode = False
if len(sys.argv) > 1:
  if sys.argv[1] == "--html":
    html_mode = True
if len(sys.argv) > 2:
  title = sys.argv[2]

first_line = True
blocks = []
block = []
data = sys.stdin.readlines()
for line in data:
  if len(line.strip()) == 0:
    if not first_line:
      blocks.append(block)
      first_line = True
      block = []
  else:
    block.append(line)
    first_line = False
if len(block) > 0:
  blocks.append(block)

body = []

if html_mode:
  body.append('<table><tbody>')
  if len(title) > 0:
    body.append('<tr><th>')
    body.append(title)
    body.append('</th></tr>')

  for idx, block in enumerate(blocks):
    if idx % 2 == 0:
      body.append('<tr><td><pre class="programlisting brush: cypher">')
      body.extend(block)
      body.append('</pre>')
      if idx == len(blocks) - 1:
        body.append('</td></tr>')
    else:
      body.append('<p>')
      body.extend(styled(block))
      body.append('</p></td></tr>')
  body.append('</tbody></table>')
else:
  body.append('<informaltable tabstyle="table" frame="all" rowsep="1" colsep="1">')
  body.append('<tgroup cols="1"><colspec />')
  if len(title) > 0:
    body.append('<thead><row><entry>')
    body.append(title)
    body.append('</entry></row></thead>')

  body.append('<tbody>')
  for idx, block in enumerate(blocks):
    if idx % 2 == 0:
      body.append('<row><entry><programlisting>')
      body.extend(block)
      body.append('</programlisting>')
      if idx == len(blocks) - 1:
        body.append('</entry></row>')
    else:
      body.append('<simpara>')
      body.extend(block)
      body.append('</simpara></entry></row>')
  body.append('</tbody></tgroup></informaltable>')

sys.stdout.write(''.join(body))
