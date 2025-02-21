import { NzMessageService } from 'ng-zorro-antd/message';
import { NzResizeEvent } from 'ng-zorro-antd/resizable';
import { forkJoin } from 'rxjs';

import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatabaseService, DatastoreService, ItemService, JournalService, SubjectService } from '@api';
import { I18NService } from '@core';

@Component({
  selector: 'app-subject-list',
  templateUrl: './subject-list.component.html',
  styleUrls: ['./subject-list.component.less']
})
export class SubjectListComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private ds: DatastoreService,
    private db: DatabaseService,
    private subs: SubjectService,
    private js: JournalService,
    private message: NzMessageService,
    private i18n: I18NService
  ) {
    this.seachForm = fb.group({
      manageFlag: ['common', []],
      assetsType: ['', []]
    });
  }

  cols = [
    {
      title: 'common.text.no',
      width: '40px'
    },
    {
      title: 'page.subject.key',
      width: '120px'
    },
    {
      title: 'page.subject.defaultName',
      width: '120px'
    },
    {
      title: 'page.subject.cd',
      width: '250px'
    },
    {
      title: 'page.subject.name'
    }
  ];

  colsWithGroup = [
    {
      title: '勘定科目コード',
      width: '120px'
    },
    {
      title: '勘定科目名',
      width: '120px'
    }
  ];

  seachForm: FormGroup;
  subjects = [];
  assets = [];

  status = false;
  // look台账显示
  isVisible = false;
  datastoreId: string;
  // 台账数据
  items: any[] = [];
  subjectItems: any[] = [];
  selectItems: any[] = [];
  selectTotal: number;
  total = 1;
  // 检索条件
  conditionParam = {
    condition_list: [],
    condition_type: 'and'
  };
  swkSubject: any[] = [];
  selectedRowIndex: number | null = null;
  @ViewChild('subjectcdInput') subjectcdInput: any;
  @ViewChild('subjectnameInput') subjectnameInput: any;

  ngOnInit(): void {
    this.search();
    this.searchAssetsData();
  }

  ngAfterViewInit(): void {}

  async search() {
    const flag = this.seachForm.get('manageFlag').value;
    if (flag === 'common') {
      this.subs.getSubjects().then((data: any[]) => {
        if (data) {
          this.subjects = data;
        } else {
          this.subjects = [];
        }
      });
    } else {
      const assetsType = this.seachForm.get('assetsType').value;
      if (assetsType) {
        await this.subs.getSubjects(assetsType).then((data: any[]) => {
          if (data) {
            this.subjects = data;
          } else {
            this.subjects = [];
          }
        });
        // 当前资源没有设置资产分类的时候，显示共通值
        if (this.subjects.length === 0) {
          this.subs.getSubjects().then((data: any[]) => {
            if (data) {
              this.subjects = data;
            } else {
              this.subjects = [];
            }
          });
        }
      } else {
        this.subjects = [];
      }
    }
  }

  async searchAssetsData() {
    let datastoreId = '';
    await this.ds.getDatastoreByKey('assets').then((data: any) => {
      if (data) {
        datastoreId = data.datastore_id;
      } else {
        datastoreId = '';
      }
    });

    if (!datastoreId) {
      return;
    }

    const sorts = [
      {
        sort_key: 'assets_class_id',
        sort_value: 'ascend'
      }
    ];

    const params = {
      condition_list: [],
      condition_type: 'and',
      sorts: sorts
    };

    let items = [];

    await this.db.getItems(datastoreId, params).then((data: any) => {
      if (data && data.total > 0 && data.items_list) {
        items = data.items_list;
      } else {
        items = [];
      }
    });

    if (items && items.length > 0) {
      items.forEach((it: any) => {
        const itemMap = it.items;
        this.assets.push({
          label: itemMap.assets_class_name.value,
          value: itemMap.assets_class_id.value
        });
      });
    }
  }

  startEdit() {
    this.status = true;
  }

  stopEdit() {
    this.status = false;
  }

  async save() {
    this.stopEdit();

    const flag = this.seachForm.get('manageFlag').value;
    if (flag === 'common') {
      const jobs = this.subjects.map(v => {
        const param = {
          pattern_id: v.pattern_id,
          subject_key: v.subject_key,
          subject_name: v.subject_name,
          subject_cd: v.subject_cd
        };
        return this.js.updateJournal(v.journal_id, param);
      });

      forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            this.message.success(this.i18n.translateLang('common.message.success.S_002'));
          }
        });
    } else {
      const assetsType = this.seachForm.get('assetsType').value;
      const jobs = this.subjects.map(v => {
        const param = {
          assets_type: assetsType,
          default_name: v.default_name,
          subject_name: v.subject_name,
          subject_cd: v.subject_cd
        };
        return this.subs.updateSubject(v.subject_key, param);
      });

      forkJoin(jobs)
        .toPromise()
        .then((data: any[]) => {
          if (data) {
            this.message.success(this.i18n.translateLang('common.message.success.S_002'));
          }
        });
    }
  }

  /**
   * @description: 调整表格行宽
   */
  onResize({ width }: NzResizeEvent, col: string): void {
    this.cols = this.cols.map(e => (e.title === col ? { ...e, width: `${width}px` } : e));
  }

  /**
   * @description: 打开关联台账数据选择画面
   */
  async openModal(index: number) {
    this.swkSubject = [];
    await this.ds.getDatastoreByKey('swkSubject').then((data: any) => {
      if (data) {
        this.datastoreId = data.datastore_id;
      } else {
        this.datastoreId = '';
      }
    });
    const params = Object.assign(this.conditionParam, {});

    await this.db.getItems(this.datastoreId, params).then((data: any) => {
      if (data && data.items_list) {
        this.subjectItems = data.items_list;
        this.selectTotal = data.total;
      } else {
        this.subjectItems = [];
        this.selectTotal = 0;
      }
      if (this.subjectItems && this.subjectItems.length > 0) {
        this.subjectItems.forEach((it: any) => {
          const itemMap = it.items;
          this.swkSubject.push({
            subjectcd: itemMap.subjectcd.value,
            subjectname: itemMap.subjectname.value
          });
        });
      }
    });

    this.selectedRowIndex = index;
    this.isVisible = true;
  }

  /**
   * @description: 关闭关联台账数据选择画面
   */
  close() {
    this.isVisible = false;
  }

  doubleClick(item: any) {
    if (this.selectedRowIndex !== null) {
      // 更新选中的行的 subject_name和subjectcd
      this.subjects[this.selectedRowIndex].subject_name = item.subjectname;
      this.subjects[this.selectedRowIndex].subject_cd = item.subjectcd;
      this.close();
    }
  }

  searchItems() {
    const params = {
      condition_list: [],
      condition_type: 'and'
    };
    const subjectcdValue = this.subjectcdInput.nativeElement.value;
    const subjectnameValue = this.subjectnameInput.nativeElement.value;

    if (subjectcdValue.trim() !== '') {
      const condition1 = {
        field_id: 'subjectcd',
        field_type: 'text',
        operator: 'like',
        is_dynamic: true,
        search_value: subjectcdValue
      };
      params.condition_list.push(condition1);
    }
    if (subjectnameValue.trim() !== '') {
      const condition2 = {
        field_id: 'subjectname',
        field_type: 'text',
        operator: 'like',
        is_dynamic: true,
        search_value: subjectnameValue
      };
      params.condition_list.push(condition2);
    }
    this.db.getItems(this.datastoreId, params).then((data: any) => {
      this.swkSubject = [];
      if (data && data.items_list && data.items_list.length > 0) {
        this.selectItems = data.items_list;
        this.selectTotal = data.total;
        this.selectItems.forEach((it: any) => {
          const itemMap = it.items;
          this.swkSubject.push({
            subjectcd: itemMap.subjectcd.value,
            subjectname: itemMap.subjectname.value
          });
        });
      } else {
        this.selectItems = [];
        this.selectTotal = 0;
      }
    });
  }
}
