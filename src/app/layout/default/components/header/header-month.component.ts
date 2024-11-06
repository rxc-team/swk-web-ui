/*
 * @Descripttion: 处理月度
 * @Author: Rxc 陳平
 * @Date: 2021-02-04 13:45:28
 * @LastEditors: Rxc 陳平
 * @LastEditTime: 2021-02-05 10:54:17
 */

import { format, getMonth, getYear } from 'date-fns';
import { NgEventBus } from 'ng-event-bus';
import { NzBreakpointService } from 'ng-zorro-antd/core/services';

import { Component, OnInit } from '@angular/core';
import { AppService } from '@api';
import { TokenStorageService } from '@core';

import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { getISOWeek } from 'date-fns';
import { result } from 'lodash';

@Component({
  selector: 'app-header-month',
  templateUrl: 'header-month.component.html'
})
export class HeaderMonthComponent implements OnInit {
  // 处理月度
  isSmall = false;
  handleMonth: string;
  encoding = ''
  constructor(
    private tokenService: TokenStorageService,
    private appService: AppService,
    private eventBus: NgEventBus,
    private bs: NzBreakpointService
  ) {
    bs.subscribe({
      xs: '480px',
      sm: '768px',
      md: '992px',
      lg: '1200px',
      xl: '1600px',
      xxl: '1600px'
    }).subscribe(data => {
      if (data === 'xs' || data === 'sm' || data === 'md') {
        this.isSmall = true;
      } else {
        this.isSmall = false;
      }
    });

    eventBus.on('change:app').subscribe(() => {
      this.init();
    });
  }

  //获取比較開始期首月
  getMonth(result: Date): void {
    const firstMonth = (getYear(result) + '-' + (getMonth(result) + 1))
    this.tokenService.getFirstMonth(firstMonth)
  }

  ngOnInit() {
    this.init();
  }

  async init() {
    const us = this.tokenService.getUser();
    const currentApp = us.current_app;
    const db = us.customer_id;
    await this.appService.getAppByID(currentApp, db).then(res => {
      if (res && res.configs.syori_ym) {
        this.handleMonth = format(new Date(res.configs.syori_ym), 'yyyy-MM');
        this.encoding = this.handleMonth
      } else {
        this.handleMonth = '';
        this.encoding = this.handleMonth
      }
    });
  }


}
