/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see https://ckeditor.com/legal/ckeditor-oss-license
 */

CKEDITOR.editorConfig = function (config) {
  // Define changes to default configuration here. For example:
  config.language = 'en';
  config.uiColor = '#ffffff';
  config.height = '50vh';
  // config.forcePasteAsPlainText = true;
  config.extraPlugins = ['image2', 'SimpleLink'];
  config.format_tags = 'p;h1;h2;h3';
  config.removePlugins = 'image';
  config.removeDialogTabs = 'image:advanced;link:advanced';
  config.allowedContent = true;
  config.basicEntities = false;
  config.image2_alignClasses = ['align-left', 'align-center', 'align-right'];
  config.toolbarGroups = [
    {name: 'styles', groups: ['styles']},
    {name: 'document', groups: ['mode', 'document', 'doctools']},
    {name: 'clipboard', groups: ['clipboard', 'undo']},
    {name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing']},
    {name: 'forms', groups: ['forms']},
    {name: 'basicstyles', groups: ['basicstyles', 'cleanup']},
    {name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph']},
    {name: 'insert', groups: ['insert']},
    {name: 'colors', groups: ['colors']},
    {name: 'tools', groups: ['tools']},
    {name: 'others', groups: ['others']},
    {name: 'about', groups: ['about']}
  ];
  config.removeButtons = 'NewPage,Preview,Print,Source,Templates,Replace,SelectAll,Scayt,Form,Checkbox,Radio,TextField,Textarea,Select,Button,ImageButton,HiddenField,CopyFormatting,RemoveFormat,Outdent,Indent,Blockquote,CreateDiv,BidiLtr,BidiRtl,Language,Link,Unlink,Anchor,Flash,Table,Smiley,SpecialChar,PageBreak,Iframe,Font,TextColor,BGColor,ShowBlocks,About,Save,Find';
  config.contentsCss = '/css/editor-style.css';
};
