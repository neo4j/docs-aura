<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" exclude-result-prefixes="d">

<xsl:template name="user.webhelp.head.content">
<xsl:text disable-output-escaping="yes">
<![CDATA[

<!-- favicon -->

<link rel="shortcut icon" href="common/images/favicon.ico" />

<!-- fonts -->

<link href='//fonts.googleapis.com/css?family=PT+Sans:400,400italic,700|Ubuntu+Mono:400,700' rel='stylesheet' type='text/css' />

<!-- Syntax Highlighter -->

<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/codemirror.min.css" />
<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/theme/neo.min.css" />
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/codemirror.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/addon/runmode/runmode.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/javascript/javascript.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/shell/shell.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/sql/sql.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/xml/xml.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/clike/clike.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/cypher/cypher.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/codemirror/5.8.0/mode/properties/properties.min.js"></script>

<script src="js/colorize.js"></script>
 
<script type="text/javascript">
  $(function (){
    CodeMirror.colorize();
  });
</script>

<!-- Section table of contents -->

<script type="text/javascript" src="js/toc.js"></script>

<!-- Cypher Console -->

<script type="text/javascript" src="js/console.js"></script>
<script type="text/javascript" src="js/cypherconsole.js"></script>

<!-- Version -->
<script type="text/javascript" src="js/version.js"></script>
<script type="text/javascript" src="js/versionswitcher.js"></script>

<!-- Discuss -->
<script type="text/javascript" src="js/mutate.min.js"></script>
<script type="text/javascript" src="js/disqus.js"></script>

<script type="text/javascript">
    /*@cc_on @*/
    /*@
     $( '#content' ).addClass( 'internet-explorer' );
     @*/
</script>

]]>
</xsl:text>

</xsl:template>

</xsl:stylesheet>

