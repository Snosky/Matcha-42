import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
    MdButtonModule, MdCheckboxModule, MdIconModule, MdInputModule, MdOptionModule,
    MdSelectModule
} from '@angular/material';

@NgModule({
  imports: [BrowserAnimationsModule, MdButtonModule, MdCheckboxModule, MdSelectModule, MdOptionModule, MdInputModule, MdIconModule],
  exports: [BrowserAnimationsModule, MdButtonModule, MdCheckboxModule, MdSelectModule, MdOptionModule, MdInputModule, MdIconModule]
})
export class MaterialModule { }
