import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BaseModule } from './base/base.module';
import { ExceptionInterceptor } from './base/interceptors/exception.interceptor';
import { NotificationService } from './base/services/notification.service';
import { DataModule } from './data/data.module';
import { ProjectsModule } from './projects/projects.module';
import { ImportModule } from './import/import.module';
import { MonitorModule } from './monitor/monitor.module';
import { GraphQLModule } from './graphql.module';
import { ProjectOverviewModule } from './project-overview/project-overview.module';
import { WeakSupervisionModule } from './weak-supervision/weak-supervision.module';
import { ZeroShotModule } from './zero-shot-details/project-overview.module';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { LabelingModule } from './labeling/labeling.module';
import { KnowledgeBasesModule } from './knowledge-bases/knowledge-bases.module';
import { ConfigModule } from './config/config.module'
import { IntercomModule } from 'ng-intercom';
import { NotificationCenterModule } from './notification-center/notification-center.module';
import { RecordIDEModule } from './record-ide/record-ide.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BaseModule,
    DataModule,
    ProjectsModule,
    ImportModule,
    MonitorModule,
    GraphQLModule,
    HttpClientModule,
    ProjectOverviewModule,
    WeakSupervisionModule,
    ZeroShotModule,
    LabelingModule,
    RecordIDEModule,
    NotificationCenterModule,
    MonacoEditorModule.forRoot(),
    KnowledgeBasesModule,
    ConfigModule,
    IntercomModule.forRoot({
      appId: 'jwhvb3yv', // from your Intercom config
      updateOnRouterChange: true, // will automatically run `update` on router event changes. Default: `false`
    }),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: ExceptionInterceptor, multi: true },
    NotificationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
