import { editor } from 'monaco-editor';
import { NgEventBus } from 'ng-event-bus';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable } from 'rxjs';

import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { FormBuilder, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FieldService, JournalService } from '@api';
import { I18NService, TokenStorageService } from '@core';

import _ from 'lodash';

// 定义条件和条件区的数据结构
interface Condition {
  con_field: string;
  con_operator: string;
  con_value: string;
}

interface ConditionGroup {
  type: 'and' | 'or'; // 组内连接符
  field_cons: Condition[]; // 组内的条件
  switch_type: 'and' | 'or'; // 组与组之间的连接符
}

interface IfCondition {
  field_groups: ConditionGroup[];
  condition_name: string;
  active: boolean;
  collapaseNotice: string;
  then_type?: string;
  else_type?: string;
  pre_else_type?:string;
  then_selected_fieldId?: string;
  then_fixed_value?: string;
  else_selected_fieldId?: string;
  else_fixed_value?: string;
  then_value: string;
  else_value: string;
  shinki_flag?: boolean;
}

@Component({
  selector: 'app-journal-condition',
  templateUrl: './journal-condition.component.html',
  styleUrls: ['./journal-condition.component.less'],
  providers: []
})
export class JournalConditionComponent implements OnInit {
  @Input() datastoreId: string;
  @Input() ifConditions: IfCondition[] = [];

  constructor(private ms: NzModalService, private fs: FieldService) {}

  // 加载中标识符
  isLoading = true;
  // 可选台账字段
  swkFields: any[] = [];

  //临时模板数据 模板功能TODO
  tempIfConditions: IfCondition[] = [
    {
      field_groups: [
        {
          type: 'and',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: '{"$eq":["a","b"]}', con_value: '111' },
            { con_field: 'shiwakeno', con_operator: '{"$ne":["a","b"]}', con_value: '111' }
          ],
          switch_type: 'or'
        },
        {
          type: 'or',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: '{"$eq":["a","b"]}', con_value: '111' },
            { con_field: 'shiwakeno', con_operator: '{"$ne":["a","b"]}', con_value: '111' }
          ],
          switch_type: 'and'
        }
      ],
      condition_name: 'カスタム条件1',
      active: false,
      collapaseNotice: '詳細を表示するにはクリックしてください',
      then_value: 'keiyakuno',
      else_value: 'keiyakuno'
    },
    {
      field_groups: [
        {
          type: 'and',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: '{"$eq":["a","b"]}', con_value: '222' },
            { con_field: 'shiwakeno', con_operator: '{"$ne":["a","b"]}', con_value: '222' }
          ],
          switch_type: 'or'
        },
        {
          type: 'or',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: '{"$eq":["a","b"]}', con_value: '222' },
            { con_field: 'shiwakeno', con_operator: '{"$ne":["a","b"]}', con_value: '222' }
          ],
          switch_type: 'and'
        }
      ],
      condition_name: 'カスタム条件2',
      active: false,
      collapaseNotice: '詳細を表示するにはクリックしてください',
      then_value: 'keiyakuno',
      else_value: 'keiyakuno'
    },
    {
      field_groups: [
        {
          type: 'and',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: '{"$eq":["a","b"]}', con_value: '333' },
            { con_field: 'shiwakeno', con_operator: '{"$ne":["a","b"]}', con_value: '333' }
          ],
          switch_type: 'or'
        },
        {
          type: 'or',
          field_cons: [
            { con_field: 'keiyakuno', con_operator: '{"$eq":["a","b"]}', con_value: '333' },
            { con_field: 'shiwakeno', con_operator: '{"$ne":["a","b"]}', con_value: '333' }
          ],
          switch_type: 'and'
        }
      ],
      condition_name: 'カスタム条件3',
      active: false,
      collapaseNotice: '詳細を表示するにはクリックしてください',
      then_value: 'keiyakuno',
      else_value: 'keiyakuno'
    }
  ];

  ngOnInit() {
    // modal框内查询可选字段
    this.fs.getFields(this.datastoreId).then((data: any[]) => {
      if (data) {
        this.swkFields = data.filter(f => f.field_type !== 'file');
        this.swkFields = this.swkFields.filter(f => !f.as_title);
      } else {
        this.swkFields = [];
      }
      this.swkFields = _.sortBy(this.swkFields, 'display_order');
      this.isLoading = false;
    });
  }

  // 添加条件
  addIfCondition() {
    if (this.ifConditions === null) {
      this.ifConditions = [
        {
          field_groups: [],
          condition_name: '',
          active: false,
          collapaseNotice: '詳細を表示するにはクリックしてください',
          then_value: '',
          else_value: '',
          then_type: '',
          else_type: '',
          then_selected_fieldId: '',
          then_fixed_value: '',
          else_selected_fieldId: '',
          else_fixed_value: ''
        }
      ];
    } else {
      this.ifConditions.push({
        field_groups: [],
        condition_name: '',
        active: false,
        collapaseNotice: '詳細を表示するにはクリックしてください',
        then_value: '',
        else_value: '',
        then_type: '',
        else_type: '',
        then_selected_fieldId: '',
        then_fixed_value: '',
        else_selected_fieldId: '',
        else_fixed_value: ''
      });
    }
  }

  // 各级删除条件和添加条件如下
  removeIfCondition(ifIndex: number) {
    if(ifIndex >= 1) {
      this.ifConditions[ifIndex - 1].else_type = 'value'
      this.ifConditions[ifIndex - 1].pre_else_type = 'value'
      this.ifConditions[ifIndex - 1].else_fixed_value = ''
    }
    this.ifConditions.splice(ifIndex, 1);
  }

  removeAfterIfCondition(ifIndex: number) {
    this.ifConditions.splice(ifIndex + 1);
  }

  addConditionGroup(type: 'and' | 'or', ifIndex: number) {
    this.ifConditions[ifIndex].field_groups.push({ type, field_cons: [], switch_type: 'and' });
  }

  addCondition(groupIndex: number, ifIndex: number) {
    this.ifConditions[ifIndex].field_groups[groupIndex].field_cons.push({ con_field: '', con_operator: '', con_value: '' });
  }

  removeCondition(groupIndex: number, conditionIndex: number, ifIndex: number) {
    this.ifConditions[ifIndex].field_groups[groupIndex].field_cons.splice(conditionIndex, 1);
  }

  removeConditionGroup(groupIndex: number, ifIndex: number) {
    this.ifConditions[ifIndex].field_groups.splice(groupIndex, 1);
  }

  // AND/OR 切换处理
  onSwitchChange(value: boolean, groupIndex: number, ifIndex: number) {
    // 当开关切换时，bool转string
    this.ifConditions[ifIndex].field_groups[groupIndex].switch_type = value || 'or' ? 'and' : 'or';
  }

  // Else类型选择处理
  onElseChange(value: string, ifIndex: number) {
    this.ifConditions[ifIndex].else_fixed_value = '';
    this.ifConditions[ifIndex].else_selected_fieldId = '';
    if (value === 'new' && !(this.ifConditions.length > ifIndex + 1)) {
      this.addIfCondition();
      this.ifConditions[ifIndex].pre_else_type = value;
    } else if (value !== 'new' && this.ifConditions[ifIndex].pre_else_type === 'new') {
      this.ms.confirm({
        nzTitle: '操作を確認する',
        nzContent: '条件追加をキャンセルしたため、この操作により以下の条件がすべて削除されます。よろしいですか?',
        nzOnOk: () => {
          this.removeAfterIfCondition(ifIndex);
          this.ifConditions[ifIndex].pre_else_type = value;
        },
        nzOnCancel: () => {
          this.ifConditions[ifIndex].else_type = 'new';
          this.ifConditions[ifIndex].pre_else_type = 'new';
        }
      });
    } 
  }

  // 折叠面板点击触发
  collapaseChange(ifIndex: number) {
    if (this.ifConditions[ifIndex].active) {
      this.ifConditions[ifIndex].collapaseNotice = '詳細を非表示にするにはクリックしてください';
    } else {
      this.ifConditions[ifIndex].collapaseNotice = '詳細を表示するにはクリックしてください';
    }
  }

  // 条件选择触发
  ifConditionChange(ifIndex: number, conditionName: string, collapaseNotice: string, active: boolean) {
    if (conditionName === 'shinki') {
      this.ifConditions[ifIndex].field_groups = [];
      this.ifConditions[ifIndex].collapaseNotice = collapaseNotice;
      this.ifConditions[ifIndex].active = false;
      this.ifConditions[ifIndex].then_value = '';
      this.ifConditions[ifIndex].shinki_flag = true;
    } else {
      // 深拷贝
      this.ifConditions[ifIndex] = Object.assign(
        {},
        this.tempIfConditions.find(ifCondition => ifCondition.condition_name === conditionName)
      );
      this.ifConditions[ifIndex].shinki_flag = false;
    }
    // 不改变展开状态
    this.ifConditions[ifIndex].collapaseNotice = collapaseNotice;
    this.ifConditions[ifIndex].active = active;
  }

  // 保存模板 TODO
  saveCondition(ifCondition: IfCondition) {}
}
