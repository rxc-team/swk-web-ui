import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { JournalListComponent } from './journal-list/journal-list.component';
import { JournalRoutingModule } from './journal-routing.module';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { JournalsettingListComponent } from './journalsetting-list/journalsetting-list.component';
import { JournalConfimComponent } from './journal-confim/journal-confim.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { JournalSendComponent } from './journal-send/journal-send.component';
import { JournalsettingConditionComponent } from './journalsetting-condition/journalsetting-condition.component';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { JournalsettingTemplateComponent } from './journalsetting-template/journalsetting-template.component';

@NgModule({
  declarations: [
    SubjectListComponent,
    JournalListComponent,
    JournalsettingListComponent,
    JournalConfimComponent,
    JournalSendComponent,
    JournalsettingConditionComponent,
    JournalsettingTemplateComponent
  ],
  imports: [SharedModule, JournalRoutingModule, DragDropModule, NzCollapseModule]
})
export class JournalModule {}
