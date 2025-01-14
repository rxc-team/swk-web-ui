import { editor } from 'monaco-editor';
import { NgEventBus } from 'ng-event-bus';
import { NzConfigService } from 'ng-zorro-antd/core/config';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, Observable } from 'rxjs';

import { ChangeDetectionStrategy, Component, forwardRef, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatastoreService, FieldService } from '@api';
import { I18NService, TokenStorageService } from '@core';
import { Select } from '@ngxs/store';
import { FuncParamComponent } from '../func-param/func-param.component';
import { FuncGenComponent } from '../func-gen/func-gen.component';
import _ from 'lodash';
// 定义条件和条件区的数据结构
interface Condition {
  field: string;
  operator: string;
  value: string;
}

interface ConditionGroup {
  type: 'and' | 'or'; // 组内连接符
  conditions: Condition[]; // 组内的条件
  switchType: 'and' | 'or'; // 组与组之间的连接符
}
@Component({
  selector: 'app-func-editor',
  templateUrl: './func-editor.component.html',
  styleUrls: ['./func-editor.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FuncEditorComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FuncEditorComponent implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() returnType: string;
  @Input() readOnly: boolean;
  @Output() jsonContentChange = new EventEmitter<string>();
  @Input() jsonContent: string;
  @Input() datastoreId: string;

  verifyError: string;
  verifyErrorParam: Object;
  formGroup: FormGroup;

  constructor(
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
  rows = [{ field: '', operator: '=', value: '' }];
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
  conditionGroups: ConditionGroup[] = [];

  // 验证公式是否合法
  check() {
    /* if (!this.value.trim()) {
      this.onChange('');
      this.eventBus.cast('func:verify', {
        result: false,
        error: 'requiredInput',
        params: {}
      });
      this.verifyError = `common.validator.requiredInput`;
      this.verifyErrorParam = {};
      this.checkStatus.next('required');
      return;
    }
    const datastoreId = this.router.snapshot.paramMap.get('d_id');
    this.fs.verifyFunc({ return_type: this.returnType, formula: this.value, datastore_id: datastoreId }).then(data => {
      if (data && data.result) {
        this.verifyError = '';
        this.verifyErrorParam = {};
        this.checkStatus.next('success');
      } else {
        this.verifyError = `${data.error}`;
        this.verifyErrorParam = data.params;
        this.checkStatus.next('error');
      }
      this.eventBus.cast('func:verify', data);
    }); */
  }
  // 编辑器初始化
  onEditorInit(e: editor.ICodeEditor): void {
    this.editor = e;
    this.editor.updateOptions({
      lineNumbers: 'on',
      automaticLayout: true,
      padding: { top: 0, bottom: 0 },
      wordWrap: 'on',
      wordWrapColumn: 100,
      formatOnPaste: true,
      formatOnType: true,
      readOnly: this.readOnly,
      minimap: { enabled: false }
    });
    if (!this.value) {
      this.value = '{\n\t\n}\n'; // 设置默认值
    }

    this.insert(this.value); // 调用插入
    this.editor.focus();

    this.tokenService.getUserInfo().subscribe((u: any) => {
      const defaultEditorOption = this.nzConfigService.getConfigForComponent('codeEditor')?.defaultEditorOption || {};
      this.nzConfigService.set('codeEditor', {
        defaultEditorOption: {
          ...defaultEditorOption,
          theme: u.theme === 'dark' ? 'vs-dark' : 'vs'
        }
      });
    });
  }

  // 显示公式生成器
  showFuncModal(): void {
    const datastoreId = this.router.snapshot.paramMap.get('d_id');
    const modal = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.formula.funcGenTitle'),
      nzContent: FuncGenComponent,
      nzWidth: 800,
      nzComponentParams: {
        datastoreId: datastoreId
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.setParam'),
          disabled: componentInstance => componentInstance.isSetParam,
          onClick: componentInstance => {
            componentInstance.isSetParam = true;
          }
        },
        {
          label: this.i18n.translateLang('common.button.reselect'),
          disabled: componentInstance => !componentInstance.isSetParam,
          onClick: componentInstance => {
            componentInstance.isSetParam = false;
            componentInstance.select = componentInstance.deepClone(componentInstance.options[0]);
          }
        },
        {
          label: this.i18n.translateLang('common.button.ok'),
          type: 'primary',
          disabled: componentInstance => !componentInstance.isSetParam,
          onClick: componentInstance => {
            let func = componentInstance.select.func;
            componentInstance.select.params.forEach(p => {
              if (p.value) {
                const reg = new RegExp(`(.*)${p.name}`);
                func = func.replace(reg, '$1' + p.value);
              }
            });
            this.insert(func);
            modal.close();
          }
        }
      ]
    });
  }

  // 显示字段选择器
  showParamModal(): void {
    const datastoreId = this.router.snapshot.paramMap.get('d_id');
    const modal = this.modal.create({
      nzTitle: this.i18n.translateLang('page.datastore.formula.paramTitle'),
      nzContent: FuncParamComponent,
      nzComponentParams: {
        datastoreId: datastoreId,
        selectParam: null
      },
      nzFooter: [
        {
          label: this.i18n.translateLang('common.button.ok'),
          onClick: async componentInstance => {
            if (!componentInstance.selectField) {
              modal.close();
              return;
            }

            const ds = componentInstance.selectDs.datastore_id;
            const field_id = componentInstance.selectField.field_id;
            const fds = componentInstance.selectField.datastore_id;
            // 如果当前字段是本台账的字段
            if (ds === fds) {
              const fs = `$items.${field_id}.value`;
              this.insert(fs);
              modal.close();
              return;
            }

            const linked = componentInstance.selectField.linked;
            const field = `$${linked}.items.${field_id}.value`;
            this.insert(field);
            modal.close();
            return;
          }
        }
      ]
    });
  }

  // 插入数据到编辑器
  insert(str: string) {
    // 检查 editor 是否初始化
    if (!this.editor) {
      console.error('Editor is not initialized!');
      return;
    }
    const position = this.editor.getPosition();
    const selection = this.editor.getSelection();
    // 没有选择的时候
    if (selection.startColumn === selection.endColumn) {
      this.editor.executeEdits('', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          },
          text: str
        }
      ]);
    } else {
      this.editor.executeEdits('', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: selection.startColumn,
            endLineNumber: position.lineNumber,
            endColumn: selection.endColumn
          },
          text: str
        }
      ]);
    }

    this.editor.setSelection({
      startLineNumber: position.lineNumber,
      startColumn: position.column,
      endLineNumber: position.lineNumber,
      endColumn: position.column + str.length
    });
    this.value = this.editor.getValue();
    this.onChange(this.value);
    this.editor.getAction('editor.action.formatDocument').run();
    this.editor.focus();
  }

  writeValue(obj: any): void {
    this.value = obj;
  }
  registerOnChange(fn: any): void {
    this.onChangeListener = fn; // 保存这个函数
  }
  registerOnTouched(fn: any): void {
    this.onTouchedListener = fn; // 保存这个函数
  }
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  propagateChange = (_: any) => {};

  ngOnInit() {
    this.fs.getFields(this.datastoreId).then((data: any[]) => {
      if (data) {
        this.swkFields = data.filter(f => f.field_type !== 'file');
        this.swkFields = this.swkFields.filter(f => !f.as_title);
      } else {
        this.swkFields = [];
      }
      this.swkFields = _.sortBy(this.swkFields, 'display_order');
    });
    setTimeout(() => {
      // 这里可以初始化默认值
      if (this.value) {
        this.eventBus.cast('func:verify', { result: true });
        this.checkStatus.next('success');
      } else {
        this.value = '{\n\t\n}\n'; // 设置默认值
      }
    }, 500);
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
    this.rows.push({ field: '', operator: '=', value: '' });
  }

  // 删除当前行
  removeRow(index: number): void {
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }

  addConditionGroup(type: 'and' | 'or') {
    this.conditionGroups.push({ type, conditions: [], switchType:'and' });
  }
  

  addCondition(groupIndex: number) {
    this.conditionGroups[groupIndex].conditions.push({ field: '', operator: '=', value: '' });
  }

  removeCondition(groupIndex: number, conditionIndex: number) {
    this.conditionGroups[groupIndex].conditions.splice(conditionIndex, 1);
  }

  removeConditionGroup(groupIndex: number) {
    this.conditionGroups.splice(groupIndex, 1);
  }

  createCondition() {
  let bigConditions = this.conditionGroups;
  // 最后的 IF 条件模板
  let ifJson = '{"$cond":{"if":"a","then":"b","else":"c"}}';
  let tempJson;
  // 只有一个大区域时
  if (bigConditions.length === 1) {
    // 获得所有小条件
    let conditions = bigConditions[0].conditions;
    // 只须获得该大区域内部逻辑
    let innerLogic = bigConditions[0].type;
    // 因为只有一个大区域，只用区域内小条件拼接
    tempJson = this.parseInnerLogic(conditions, innerLogic);
    // 两个或两个以上大区域时
  } else if (bigConditions.length > 1) {
    // 循环大区域
    bigConditions.forEach((bigCon, index) => {
      // 获得小条件数组
      let conditions = bigCon.conditions;
      // 获得该区域的内部逻辑
      let innerLogic = bigCon.type;
      // 第二个区域后的拼接需要执行区域内拼接和区域间拼接
      if (index > 0) {
        // 因为有错位关系，第一个区域的条件和外部逻辑在上一次循环中。第二个区域的条件在本次循环中
        let outerLogic = bigConditions[index - 1].switchType;
        let json1 = tempJson;
        // 区域内拼接
        let json2 = this.parseInnerLogic(conditions, innerLogic);
        // 区域间拼接
        tempJson = this.parseOuterLogic(json1, json2, outerLogic);
        // 第一次循环，第一个区域拼接只需要区域内拼接
      } else {
        tempJson = this.parseInnerLogic(conditions, innerLogic);
      }
    });
  }
  // If条件替换
  ifJson = ifJson.replace(new RegExp(`(.*)"a"`), '$1' + tempJson);
  if (this.selectionType=="field") {
    ifJson = ifJson.replace(new RegExp(`(.*)b`), '$1' + this.selectedFieldId);
  }else{
    ifJson = ifJson.replace(new RegExp(`(.*)c`), '$1' + this.fixedValue);
  }
  if (this.selectionType1=="field") {
    ifJson = ifJson.replace(new RegExp(`(.*)b`), '$1' + this.selectedFieldId1);
  }else{
    ifJson = ifJson.replace(new RegExp(`(.*)c`), '$1' + this.fixedValue1);
  }
  }

  // 区域内Json替换
  parseInnerLogic(conditions: any[], logic: string): string {
    let temp = '';
    // 只有一个条件时，不额外添加or 或 and
    if (conditions.length === 1) {
      conditions[0].operator = conditions[0].operator.replace(new RegExp(`(.*)a`), '$1' + "$items."+conditions[0].field+".value");
      conditions[0].operator = conditions[0].operator.replace(new RegExp(`(.*)b`), '$1' + conditions[0].value);
      return conditions[0].operator;
    }
    // 超过一个条件时，循环拼接条件
    conditions.forEach((con, index) => {
      con.operator = con.operator.replace(new RegExp(`(.*)a`), '$1' + "$items."+con.field+".value");
      con.operator = con.operator.replace(new RegExp(`(.*)b`), '$1' + con.value);
      if (index === 0) {
        temp = temp.concat('[');
      }
      temp = temp.concat(con.operator);
      if (index < conditions.length - 1) {
        temp = temp.concat(',');
      }
      if (index === conditions.length - 1) {
        temp = temp.concat(']');
      }
    });
 
    if (logic === 'and') {
      return '{"$and":' + temp + '}';
    } else if (logic === 'or') {
      return '{"$or":' + temp + '}';
    }
  }
 
  // 区域间Json替换
  parseOuterLogic(json1: string, json2: string, logic: string): string {
    let temp = '';
    temp = temp.concat('[').concat(json1).concat(',').concat(json2).concat(']');
    if (logic === 'and') {
      return '{"$and":' + temp + '}';
    } else if (logic === 'or') {
      return '{"$or":' + temp + '}';
    }
  }

}
