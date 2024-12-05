import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';

import { Component, OnInit } from '@angular/core';
import { AppService, JournalService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-journal-list',
  templateUrl: './journal-confim.component.html',
  styleUrls: ['./journal-confim.less']
})
export class JournalConfimComponent implements OnInit {
  constructor(
    private js: JournalService,
    private modal: NzModalService,
    private message: NzMessageService,
    private i18n: I18NService,
    private appService: AppService,
    private tokenService: TokenStorageService
  ) {}

  confirmModal: NzModalRef;

  ngOnInit() {}

  async confim() {
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;
    await this.appService.getAppByID(currentApp, db).then(async res => {
      if (!res.swk_control) {
        await this.js.getSakuseiData().then(async (data: any) => {
          if (data.total == 0) {
            this.confirmModal = this.modal.confirm({
              nzTitle: `${this.i18n.translateLang('common.message.confirm.journalConfim')}`,
              nzContent: `${this.i18n.translateLang('common.message.confirm.journalConfimContent')}`,
              nzOnOk: async () => {
                await this.message.info(this.i18n.translateLang('common.message.info.I_003'));
                this.js.journalConfim();
              }
            });
          } else {
            this.message.info(this.i18n.translateLang('common.message.info.I_003'));
            await this.js.journalConfim();
          }
        });
      } else {
        this.message.error(this.i18n.translateLang('common.message.error.E_022'));
      }
    });
  }
}
