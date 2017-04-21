import { NgModule } from '@angular/core';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MdButtonModule, MdCheckboxModule, MdInputModule, MdOptionModule, MdSelectModule} from '@angular/material';

@NgModule({
  imports: [BrowserAnimationsModule, MdButtonModule, MdCheckboxModule, MdSelectModule, MdOptionModule, MdInputModule],
  exports: [BrowserAnimationsModule, MdButtonModule, MdCheckboxModule, MdSelectModule, MdOptionModule, MdInputModule]
})
export class MaterialModule { }
