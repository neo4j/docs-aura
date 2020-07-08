#!/usr/bin/env python
# -*- mode: Python; coding: utf-8 -*-

import sys
from xml.sax.saxutils import escape
from xml.sax.saxutils import unescape

def out_entries(entries,html_mode):
  buff = []
  if html_mode:
    buff.append('<tr>')
    for entry in entries:
      buff.append('<td align="left" valign="top">')
      buff.append('<p><code class="literal">')
      buff.append(entry.strip())
      buff.append('</code></p>')
      buff.append('</td>')
    buff.append('</tr>')
  else:
    buff.append('<row>')
    for entry in entries:
      buff.append('<entry align="left" valign="top">')
      buff.append('<simpara><literal>')
      buff.append(entry.strip())
      buff.append('</literal></simpara>')
      buff.append('</entry>')
    buff.append('</row>')
  return buff

data = sys.stdin.readlines()
html_mode = False
if len(sys.argv) > 1:
  if sys.argv[1] == "--html":
    html_mode = True

body = []

if html_mode:
  body.append('<div>')
  body.append('    <div style="float: left" class="curvedarrow">&nbsp;</div>')
  body.append('    <pre class="statsonlyqueryresult">')
  for line in data:
    body.append(line.strip())
  body.append('    </pre>')
  body.append('</div>')
else:
  for line in data:
    buff.append('<simpara><literal>')
    body.append(line.strip())
    buff.append('</literal></simpara>')
  
sys.stdout.write(''.join(body))
