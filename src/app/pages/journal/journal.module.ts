import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { JournalListComponent } from './journal-list/journal-list.component';
import { JournalRoutingModule } from './journal-routing.module';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { JournalsettingListComponent } from './journalsetting-list/journalsetting-list.component';
import { JournalConfimComponent } from './journal-confim/journal-confim.component';
import { DragDropModule } from '@angular/cdk/drag-drop'; 
import { JournalSendComponent } from './journal-send/journal-send.component';
import { FuncEditorComponent } from './func-editor/func-editor.component';
import { FuncParamComponent } from './func-param/func-param.component';
import { FuncGenComponent } from './func-gen/func-gen.component';

@NgModule({
  declarations: [SubjectListComponent, JournalListComponent, JournalsettingListComponent, JournalConfimComponent,JournalSendComponent,FuncEditorComponent,FuncParamComponent,FuncGenComponent],
  imports: [SharedModule, JournalRoutingModule,DragDropModule],
})
export class JournalModule {}
