import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HelloWorldComponent } from './hello-world/hello-world.component';
import { FormsModule } from '@angular/forms';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginButtonComponent } from './login-button/login-button.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ParticlesBackgroundComponent } from './particles-background/particles-background.component';

@NgModule({
  declarations: [
    AppComponent,
    HelloWorldComponent,
    ChatboxComponent,
    HomepageComponent,
    LoginButtonComponent,
    SidenavComponent,
    ParticlesBackgroundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
