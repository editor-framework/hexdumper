'use strict';

const Fs = require('fire-fs');
const Hexy = Editor.require('packages://hexdumper/node_modules/hexy');

Editor.Panel.extend({
  style: `
    :host {
      display: flex;
      flex-direction: column;
      margin: 5px;
    }

    .mask {
      border: 2px solid #0f0;
      background: rgba(0,255,0,0.3);
    }

    #viewer {
      white-space: pre;
      overflow-y: auto;

      font-family: Menlo;
    }
  `,

  template: `
    <h2>Hex Dumper</h2>
    <div id="viewer"></div>
    <div class="mask fit" hidden></div>
  `,

  $: {
    mask: '.mask',
    viewer: '#viewer',
  },

  behaviors: [
    Editor.UI.Droppable
  ],

  ready () {
    this.droppable = 'file';
    this.singleDrop = true;
    this._initDroppable(this);

    this.addEventListener('dragover', event => {
      let type = Editor.UI.DragDrop.type(event.dataTransfer);
      if ( type !== 'file' ) {
        return;
      }

      // NOTE: this two are important
      event.preventDefault();
      event.stopPropagation();

      Editor.UI.DragDrop.updateDropEffect(event.dataTransfer, 'copy');
    });

    this.addEventListener('drop-area-enter', event => {
      this.$mask.hidden = false;

      event.stopPropagation();
      Editor.UI.DragDrop.updateDropEffect(event.detail.dataTransfer, 'copy');
      Editor.UI.DragDrop.allowDrop( event.detail.dataTransfer, true );
    });

    this.addEventListener('drop-area-accept', event => {
      event.stopPropagation();

      this.$mask.hidden = true;

      let dragItems = event.detail.dragItems;
      let path = dragItems[0];

      // process
      let buf = Fs.readFileSync(path);
      let str = Hexy.hexy(buf);
      Editor.UI.clear(this.$viewer);
      this.$viewer.innerText = str;
    });

    this.addEventListener('drop-area-leave', event => {
      event.stopPropagation();

      this.$mask.hidden = true;
    });
  },

  // ipc
  messages: {
  },
});

