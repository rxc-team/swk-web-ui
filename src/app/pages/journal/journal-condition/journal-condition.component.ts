import { editor } from 'monaco-editor';
import { NgEventBus } from 'ng-event-bus';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable } from 'rxjs';

import { ChangeDetectionStrategy, Component, forwardRef, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => JournalConditionComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JournalConditionComponent implements OnInit, OnDestroy {
  @Input() returnType: string;
  @Input() readOnly: boolean;
  @Output() jsonContentChange = new EventEmitter<string>();
  @Input() handleOK = new EventEmitter<string>();
  @Input() jsonContent: string;
  @Input() datastoreId: string;
  @Input() ifConditions: IfCondition[] = [];

  verifyError: string;
  verifyErrorParam: Object;
  formGroup: FormGroup;

  constructor(
    private js: JournalService,
    private fs: FieldService,
    private modal: NzModalService,
    private router: ActivatedRoute,
    private tokenService: TokenStorageService,
    private nzConfigService: NzConfigService,
    private eventBus: NgEventBus,
    private i18n: I18NService,
    private fb: FormBuilder
  ) {}

  @Input() isSmall = false;
  // 组件对应的 “ ngModel ”
  value = '';
  // 组件对应的 “ disabled ”
  isDisabled: boolean;
  // 改变值回调
  onChangeListener: Function;
  // 交互回调
  onTouchedListener: Function;
  // 编辑器设置
  editorOptions = {
    theme: 'vs',
    language: 'json'
  };
  checkStatus = new BehaviorSubject<string>('wait');
  // 编辑器实例
  editor?: editor.ICodeEditor;
  swkFields: any[] = [];
  rows = [{ con_field: '', con_operator: '=', con_value: '' }];
  operators: string[] = [];
  selectionType: 'field' | 'value' = 'field'; // 默认选择台账字段

  // 存储用户选择的字段或固定值
  selectedFieldId: string;
  fixedValue: string;

  selectionType1: 'field' | 'value' = 'field'; // 默认选择台账字段

  // 存储用户选择的字段或固定值
  selectedFieldId1: string;
  fixedValue1: string;
  selectedCondition: string;
  selectedOperator: string;
  groups: ConditionGroup[] = [];
  ifConditions1: IfCondition[] = []

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
      collapaseNotice: '点击展开条件详情',
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
      collapaseNotice: '点击展开条件详情',
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
      collapaseNotice: '点击展开条件详情',
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
    });
  }

  ngOnDestroy(): void {
    this.checkStatus.unsubscribe();
  }

  /**
   * 自定义当组件发生改变时，会调用的方法
   */
  onChange(payload) {
    this.value = payload;
    //this.onChangeListener(payload); // 告诉form，你的表单值改变成了payload
    //this.onTouchedListener(); // 告诉form，你的表单有交互发生
    this.jsonContentChange.emit(this.value);
    this.eventBus.cast('func:verify', null);
    this.checkStatus.next('wait');
  }

  // 添加新行
  addRow(): void {
    this.rows.push({ con_field: '', con_operator: '', con_value: '' });
  }

  // 删除当前行
  removeRow(index: number): void {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }

  addIfCondition() {
    this.ifConditions.push({
      field_groups: [],
      condition_name: '',
      active: false,
      collapaseNotice: '点击展开条件详情',
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

  removeIfCondition(ifIndex: number) {
    this.ifConditions.splice(ifIndex, 1);
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

  onSwitchChange(value: boolean, groupIndex: number, ifIndex: number) {
    // 当开关切换时，改变字符串值
    this.ifConditions[ifIndex].field_groups[groupIndex].switch_type = value || 'or' ? 'and' : 'or';
  }

  // 折叠面板点击触发
  collapaseChange(ifIndex: number) {
    if (this.ifConditions[ifIndex].active) {
      this.ifConditions[ifIndex].collapaseNotice = '点击收起条件详情';
    } else {
      this.ifConditions[ifIndex].collapaseNotice = '点击展开条件详情';
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
      // 浅拷贝
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

  // createCondition() {
  //   let bigConditions = this.groups;
  //   // 最后的 IF 条件模板
  //   let ifJson = '{"$cond":{"if":"a","then":"b","else":"c"}}';
  //   let tempJson;
  //   // 只有一个大区域时
  //   if (bigConditions.length === 1) {
  //     // 获得所有小条件
  //     let conditions = bigConditions[0].field_cons;
  //     // 只须获得该大区域内部逻辑
  //     let innerLogic = bigConditions[0].type;
  //     // 因为只有一个大区域，只用区域内小条件拼接
  //     tempJson = this.parseInnerLogic(conditions, innerLogic);
  //     // 两个或两个以上大区域时
  //   } else if (bigConditions.length > 1) {
  //     // 循环大区域
  //     bigConditions.forEach((bigCon, index) => {
  //       // 获得小条件数组
  //       let conditions = bigCon.field_cons;
  //       // 获得该区域的内部逻辑
  //       let innerLogic = bigCon.type;
  //       // 第二个区域后的拼接需要执行区域内拼接和区域间拼接
  //       if (index > 0) {
  //         // 因为有错位关系，第一个区域的条件和外部逻辑在上一次循环中。第二个区域的条件在本次循环中
  //         let outerLogic = bigConditions[index - 1].switch_type;
  //         let json1 = tempJson;
  //         // 区域内拼接
  //         let json2 = this.parseInnerLogic(conditions, innerLogic);
  //         // 区域间拼接
  //         tempJson = this.parseOuterLogic(json1, json2, outerLogic);
  //         // 第一次循环，第一个区域拼接只需要区域内拼接
  //       } else {
  //         tempJson = this.parseInnerLogic(conditions, innerLogic);
  //       }
  //     });
  //   }
  //   // If条件替换
  //   ifJson = ifJson.replace(new RegExp(`(.*)"a"`), '$1' + tempJson);
  //   if (this.selectionType == 'field') {
  //     ifJson = ifJson.replace(new RegExp(`(.*)b`), '$1' + this.selectedFieldId);
  //   } else {
  //     ifJson = ifJson.replace(new RegExp(`(.*)c`), '$1' + this.fixedValue);
  //   }
  //   if (this.selectionType1 == 'field') {
  //     ifJson = ifJson.replace(new RegExp(`(.*)b`), '$1' + this.selectedFieldId1);
  //   } else {
  //     ifJson = ifJson.replace(new RegExp(`(.*)c`), '$1' + this.fixedValue1);
  //   }
  // }

  // // 区域内Json替换
  // parseInnerLogic(conditions: any[], logic: string): string {
  //   let temp = '';
  //   // 只有一个条件时，不额外添加or 或 and
  //   if (conditions.length === 1) {
  //     conditions[0].con_operator = conditions[0].con_operator.replace(new RegExp(`(.*)a`), '$1' + '$items.' + conditions[0].field + '.value');
  //     conditions[0].con_operator = conditions[0].con_operator.replace(new RegExp(`(.*)b`), '$1' + conditions[0].value);
  //     return conditions[0].operator;
  //   }
  //   // 超过一个条件时，循环拼接条件
  //   conditions.forEach((con, index) => {
  //     con.con_operator = con.con_operator.replace(new RegExp(`(.*)a`), '$1' + '$items.' + con.field + '.value');
  //     con.con_operator = con.con_operator.replace(new RegExp(`(.*)b`), '$1' + con.value);
  //     if (index === 0) {
  //       temp = temp.concat('[');
  //     }
  //     temp = temp.concat(con.operator);
  //     if (index < conditions.length - 1) {
  //       temp = temp.concat(',');
  //     }
  //     if (index === conditions.length - 1) {
  //       temp = temp.concat(']');
  //     }
  //   });

  //   if (logic === 'and') {
  //     return '{"$and":' + temp + '}';
  //   } else if (logic === 'or') {
  //     return '{"$or":' + temp + '}';
  //   }
  // }

  // // 区域间Json替换
  // parseOuterLogic(json1: string, json2: string, logic: string): string {
  //   let temp = '';
  //   temp = temp.concat('[').concat(json1).concat(',').concat(json2).concat(']');
  //   if (logic === 'and') {
  //     return '{"$and":' + temp + '}';
  //   } else if (logic === 'or') {
  //     return '{"$or":' + temp + '}';
  //   }
  // }
}
