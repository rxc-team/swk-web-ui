import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JournalListComponent } from './journal-list/journal-list.component';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { JournalsettingListComponent } from './journalsetting-list/journalsetting-list.component';
import { JournalConfimComponent } from './journal-confim/journal-confim.component';
import { JournalSendComponent } from './journal-send/journal-send.component';

const routes: Routes = [
  {
    path: 'list', // report/:r_id
    component: JournalListComponent,
    runGuardsAndResolvers: 'always',
    data: {
      title: 'route.journal',
      breadcrumb: 'route.journal'
    }
  },
  {
    path: 'subjects', // report/:r_id
    component: SubjectListComponent,
    runGuardsAndResolvers: 'always',
    data: {
      title: 'route.subject',
      breadcrumb: 'route.subject'
    }
  },
  {
    path: 'journalsetting', // report/:r_id
    component: JournalsettingListComponent,
    runGuardsAndResolvers: 'always',
    data: {
      title: 'route.journalsetting',
      breadcrumb: 'route.journalsetting'
    }
  },
  {
    path: 'journalConfim',
    component: JournalConfimComponent,
    runGuardsAndResolvers: 'always',
    data: {
      title: 'route.journalConfim',
      breadcrumb: 'route.journalConfim'
    }
  },
  {
    path: 'journalSend',
    component: JournalSendComponent,
    runGuardsAndResolvers: 'always',
    data: {
      title: 'route.journalSend',
      breadcrumb: 'route.journalSend'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalRoutingModule {}
