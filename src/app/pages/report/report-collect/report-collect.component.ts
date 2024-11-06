/*
 * @Description: collect
 * @Author: 王世佳
 * @Date: 2023-04-04 09:06:57
 * @LastEditors: 孫学霖、李景哲
 * @LastEditTime: 2023-11-16 18:18:54
 */
import * as _ from 'lodash';
import { NzMessageService } from 'ng-zorro-antd/message';
import { forkJoin } from 'rxjs';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ReportService, DatastoreService, FieldService } from '@api';
import { I18NService } from '@core';
import { NzResizeEvent } from 'ng-zorro-antd/resizable/resizable.directive';

@Component({
  selector: 'app-report-collect',
  templateUrl: './report-collect.component.html',
  styleUrls: ['./report-collect.component.less']
})
export class ReportCollectComponent implements OnInit, OnDestroy {

  // 加载flag
  update = false;
  scroll = { x: '1000px', y: '300px' };

  //总表数据
  seachForm: FormGroup;
  listOfDataDisplay = [];
  playerName: string;
  lastUpdateTime = '';

  // 当前页
  pageIndex = 1;
  // 当前页件数
  pageSize = 30;
  // 总数
  total = 0;
  // 画面展示总数
  showTotal = 10000;

  // 获取字段名称
  cols = [];
  keiyakudaicho_id: string
  FieldName = [];
  titleName = [];

  constructor(
    private field: FieldService,
    private fb: FormBuilder,
    private report: ReportService,
    private route: ActivatedRoute,
    private i18n: I18NService,
    private message: NzMessageService,
    private ds: DatastoreService,
  ) {
    this.seachForm = this.fb.group({
      keiyakuno: ['', []],
      coldate: ['', []]
    });
  }

  /**
  * @description: 画面销毁处理
  */
  ngOnDestroy() { }

  /**
   * @description: 画面初始化
   */
  async ngOnInit(): Promise<void> {
    const jobs_keiyakudaicho = [this.ds.getDatastoreByKey('keiyakudaicho')];
    await forkJoin(jobs_keiyakudaicho)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0]
        this.keiyakudaicho_id = dsData.datastore_id
      });
    const fields_all = [this.field.getFields(this.keiyakudaicho_id)]
    await forkJoin(fields_all)
      .toPromise()
      .then((data: any[]) => {
        if (data) {
          const fields = data[0].filter(f => !f.as_title);
          fields.forEach(f => {
            if (f.field_id == 'field_viw') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_22c') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_1av') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_206') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_14l') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_7p3') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_248') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_3k7') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_1vg') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_5fj') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_20h') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_2h1') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_qi4') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_1ck') {
              this.FieldName.push(f.field_name)
            }
            if (f.field_id == 'field_u1q') {
              this.FieldName.push(f.field_name)
            }
          });
        }
      });

    this.cols.push({
      title: 'page.coldata.keiyakuno',
      width: '120px'
    },
      {
        title: 'page.coldata.keiyakuymd',
        width: '100px'
      },
      {
        title: 'page.coldata.leasestymd',
        width: '100px'
      },
      {
        title: 'page.coldata.leasekikan',
        width: '100px'
      },
      {
        title: 'page.coldata.leaseexpireymd',
        width: '100px'
      },
      {
        title: 'page.coldata.extentionOption',
        width: '100px'
      },
      {
        title: 'page.coldata.keiyakunm',
        width: '100px'
      },
      {
        title: 'page.coldata.biko1',
        width: '100px'
      },
      {
        title: 'page.coldata.paymentstymd',
        width: '100px'
      },
      {
        title: 'page.coldata.paymentcycle',
        width: '100px'
      },
      {
        title: 'page.coldata.paymentday',
        width: '100px'
      },
      {
        title: 'page.coldata.paymentcounts',
        width: '100px'
      },
      {
        title: 'page.coldata.residualValue',
        width: '100px'
      },
      {
        title: 'page.coldata.rishiritsu',
        width: '100px'
      },
      {
        title: 'page.coldata.initialDirectCosts',
        width: '100px'
      },
      {
        title: 'page.coldata.restorationCosts',
        width: '100px'
      },
      {
        title: 'page.coldata.sykshisankeisan',
        width: '100px'
      },
      {
        title: 'page.coldata.segmentcd',
        width: '100px'
      },
      {
        title: 'page.coldata.bunruicd',
        width: '100px'
      },
      {
        title: this.FieldName[0],
        width: '110px'
      },
      {
        title: this.FieldName[1],
        width: '110px'
      },
      {
        title: this.FieldName[2],
        width: '110px'
      },
      {
        title: this.FieldName[3],
        width: '110px'
      },
      {
        title: this.FieldName[4],
        width: '110px'
      },
      {
        title: this.FieldName[5],
        width: '110px'
      },
      {
        title: this.FieldName[6],
        width: '110px'
      },
      {
        title: this.FieldName[7],
        width: '110px'
      },
      {
        title: this.FieldName[8],
        width: '110px'
      },
      {
        title: this.FieldName[9],
        width: '110px'
      },
      {
        title: this.FieldName[10],
        width: '100px'
      },
      {
        title: this.FieldName[11],
        width: '100px'
      },
      {
        title: this.FieldName[12],
        width: '100px'
      },
      {
        title: this.FieldName[13],
        width: '100px'
      },
      {
        title: this.FieldName[14],
        width: '100px'
      },
      {
        title: 'page.coldata.hkkjitenzan',
        width: '100px'
      },
      {
        title: 'page.coldata.sonnekigaku',
        width: '100px'
      },
      {
        title: 'page.coldata.year',
        width: '60px'
      },
      {
        title: 'page.coldata.month',
        width: '40px'
      },
      {
        title: 'page.coldata.paymentleasefee',
        width: '100px'
      },
      {
        title: 'page.coldata.firstbalance',
        width: '100px'
      },
      {
        title: 'page.coldata.repayment',
        width: '100px'
      },
      {
        title: 'page.coldata.balance',
        width: '100px'
      },
      {
        title: 'page.coldata.interest',
        width: '100px'
      },
      {
        title: 'page.coldata.boka',
        width: '100px'
      },
      {
        title: 'page.coldata.syokyaku',
        width: '100px'
      },
      {
        title: 'page.coldata.endboka',
        width: '100px'
      })

    this.route.data.subscribe(async (data: { listData: any }) => {
      this.pageIndex = 1;
      this.pageSize = 30;
      this.update = true
      await this.report.getColData({
        page_index: this.pageIndex,
        page_size: this.pageSize
      })
        .then((data: any) => {
          if (data) {
            if (data.colDatas === undefined) {
              this.lastUpdateTime = ''
              this.update = false
            } else {
              this.lastUpdateTime = data.colDatas[0].update_time
              this.update = false
            }
            this.total = data.total;
            if (data.total < this.showTotal) {
              this.showTotal = data.total;
            }
            this.listOfDataDisplay = data.colDatas;
          } else {
            this.total = 0;
          }
        });
    });
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
    // 保存当前标题设置到本地存储
    const reportId = this.route.snapshot.paramMap.get('r_id');
    localStorage.setItem(reportId, JSON.stringify(this.cols));
  }

  /**
   * @description: 检索数据
   */
  async search(sizeChange: boolean) {
    if (sizeChange) {
      this.pageIndex = 1;
    }

    const params = {
      keiyakuno: this.seachForm.controls.keiyakuno.value,
      date: this.seachForm.controls.coldate.value,
    };
    this.update = true
    await this.report.selectColData({
      page_index: this.pageIndex,
      page_size: this.pageSize
    }, params)
      .then((data: any) => {
        if (data) {
          this.total = data.total;
          if (data.total < this.showTotal) {
            this.showTotal = data.total;
          }
          this.listOfDataDisplay = data.colDatas;
          if (data.colDatas === undefined) {
            this.lastUpdateTime = ''
            this.update = false
          } else {
            this.lastUpdateTime = data.colDatas[0].update_time
            this.update = false
          }
        } else {
          this.total = 0;
        }
      });
  }

  /**
   * @description: 重置事件
   */
  reset() {
    this.seachForm.reset({
      keiyakuno: '',
      coldate: ''
    });
  }

  /**
   * @description: 下载为CSV文件
   */
  async downloadCSV() {
    for (let i = 0; i < this.FieldName.length; i++) {
      this.titleName.push(this.i18n.translateLang(this.FieldName[i]))
    }
    const params = {
      keiyakuno: this.seachForm.controls.keiyakuno.value,
      date: this.seachForm.controls.coldate.value,
      titlename: this.titleName,
    };
    await this.report.downloadColData(params).then(() => {
      this.message.info(this.i18n.translateLang('common.message.info.I_002'));
    });
  }

  /**
   * 刷新数据
   */
  async genColData() {
    var paymentStatus_id, paymentInterest_id, repayment_id, keiyakudaicho_id, app_id
    const jobs = [this.ds.getDatastoreByKey('paymentStatus')];
    await forkJoin(jobs)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0]
        paymentStatus_id = dsData.datastore_id
      });
    const jobs2 = [this.ds.getDatastoreByKey('paymentInterest')];
    await forkJoin(jobs2)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0]
        paymentInterest_id = dsData.datastore_id
      });
    const jobs3 = [this.ds.getDatastoreByKey('repayment')];
    await forkJoin(jobs3)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0]
        repayment_id = dsData.datastore_id
        app_id = dsData.app_id
      });
    const jobs4 = [this.ds.getDatastoreByKey('keiyakudaicho')];
    await forkJoin(jobs4)
      .toPromise()
      .then((data: any[]) => {
        const dsData = data[0]
        keiyakudaicho_id = dsData.datastore_id
      });

    const param = {
      items: {}
    };
    param.items['paymentStatus'] = {
      data_type: 'string',
      value: paymentStatus_id
    };
    param.items['paymentInterest'] = {
      data_type: 'string',
      value: paymentInterest_id
    };
    param.items['repayment'] = {
      data_type: 'string',
      value: repayment_id
    };
    param.items['keiyakudaicho'] = {
      data_type: 'string',
      value: keiyakudaicho_id
    };
    param.items['appID'] = {
      data_type: 'string',
      value: app_id
    };

    this.report.genColData(app_id, param).then(data => {
      if (data && data.msg) {
        this.message.error(data.msg);
      } else {
        this.message.info(this.i18n.translateLang('common.message.info.I_003'));
      }
    });
  }
}

