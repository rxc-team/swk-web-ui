import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Component, OnInit } from '@angular/core';
import { JournalService } from '@api';
import { I18NService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-confim.component.html',
  styleUrls: ['./journal-confim.less']
})
export class JournalConfimComponent implements OnInit {
  constructor(private js: JournalService, private modal: NzModalService, private message: NzMessageService, private i18n: I18NService) {}

  confirmModal: NzModalRef;

  ngOnInit() {}

  confim() {
    this.js.getSakuseiData().then((data: any) => {
      if (data.total == 0) {
        this.confirmModal = this.modal.confirm({
          nzTitle: `${this.i18n.translateLang('common.message.confirm.journalConfim')}`,
          nzContent: `${this.i18n.translateLang('common.message.confirm.journalConfimContent')}`,
          nzOnOk: () => {
            this.message.info(this.i18n.translateLang('common.message.info.I_003'));
            this.js.journalConfim();
          }
        });
      } else {
        this.message.info(this.i18n.translateLang('common.message.info.I_003'));
        this.js.journalConfim();
      }
    });
  }
}
