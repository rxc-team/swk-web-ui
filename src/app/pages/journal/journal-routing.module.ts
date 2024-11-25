import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { JournalListComponent } from './journal-list/journal-list.component';
import { SubjectListComponent } from './subject-list/subject-list.component';
import { JournalsettingListComponent } from './journalsetting-list/journalsetting-list.component';

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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JournalRoutingModule {}
