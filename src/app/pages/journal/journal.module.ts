import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '@shared';

import { JournalListComponent } from './journal-list/journal-list.component';
import { JournalRoutingModule } from './journal-routing.module';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { JournalsettingListComponent } from './journalsetting-list/journalsetting-list.component';
import { JournalConfimComponent } from './journal-confim/journal-confim.component';

@NgModule({
  declarations: [SubjectListComponent, JournalListComponent, JournalsettingListComponent, JournalConfimComponent],
  imports: [SharedModule, JournalRoutingModule]
})
export class JournalModule {}
