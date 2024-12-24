import { NzModalRef } from 'ng-zorro-antd/modal';

import { Component, OnInit } from '@angular/core';
import { JournalService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-send.component.html',
  styleUrls: ['./journal-send.less']
})
export class JournalSendComponent implements OnInit {
  constructor(private js: JournalService, private message: NzMessageService, private i18n: I18NService) {}

  confirmModal: NzModalRef;

  ngOnInit() {}

  /**
   * @description: 分录下载
   */
  download() {
    this.js.swkDownload();
    this.message.info(this.i18n.translateLang('common.message.info.I_002'));
  }
}
