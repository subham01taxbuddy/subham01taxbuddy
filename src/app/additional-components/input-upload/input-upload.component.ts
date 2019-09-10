/**
 * (c) OneGreenDiary Software Pvt. Ltd. 
 * This file is a part of OneGreenDiary platform code base.
 *
 * This file is distributed under following terms:
 * 1) OneGreenDiary owns the OneGreenDiary platform, of which this file is a part.
 * 2) Any modifications to the base platform by OneGreenDiary is owned by OneGreenDiary and will be 
 *    non-exclusively used by OneGreenDiary Software Pvt. Ltd. for its clients and partners.
 * 3) Rights of any third-party customizations that do not alter the base platform, 
 *    solely reside with the third-party.  
 * 4) OneGreenDiary Software Pvt. Ltd. is free to  change the licences of the base platform to permissive 
 *    opensource licences (e.g. Apache/EPL/MIT/BSD) in future.
 * 5) Onces OneGreenDiary platform is delivered to third party, they are free to modify the code for their internal use.
 *    Any such modifications will be solely owned by the third party.
 * 6) The third party may not redistribute the OneGreenDiary platform code base in any form without 
 *    prior agreement with OneGreenDiary Software Pvt. Ltd. 
 * 7) Third party agrees to preserve the above notice for all the OneGreenDiary platform files.
 */
 
import { Component, OnInit, EventEmitter, HostListener, Output, Input } from '@angular/core';

@Component({
  selector: 'app-input-upload',
  templateUrl: './input-upload.component.html',
  styleUrls: ['./input-upload.component.css']
})
export class InputUploadComponent implements OnInit {

	@Input('upload') upload: boolean;
	@Input('input_id') input_id: string;

	@Output() filesDropped = new EventEmitter<FileList>();
	@Output() filesHovered = new EventEmitter();
	@Output() filesUpload = new EventEmitter();

  constructor() { }

  ngOnInit() {
	this.input_id = this.input_id ? this.input_id : 'ogp_images';
  }

    getBase64(file) {
	  return new Promise((resolve, reject) => {
	    const reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = () => resolve(reader.result);
	    reader.onerror = error => reject(error);
	  });
	}	
	
  	@HostListener('drop', ['$event'])
		onDrop($event) {
			$event.preventDefault();
			
			let transfer = $event.dataTransfer;
			this.filesDropped.emit(transfer.files);
			this.filesHovered.emit(false);
			this.getBase64($event.target.files[0]).then(result => {
				this.upload = true;
				this.filesUpload.emit(result);							
			})
			.catch(error => {
				this.upload = false;
				console.log(error);
			})
		}

	@HostListener('dragover', ['$event'])
		onDragOver($event) {
			$event.preventDefault();
			this.filesHovered.emit(true);
			this.upload = false;
			this.filesUpload.emit(this.upload);		
		}

	@HostListener('dragleave', ['$event'])
		onDragLeave($event) {
			this.filesHovered.emit(false);		
		}

	@HostListener('click', ['$event'])
		onClick($event) {
			console.log("click");
			this.upload = false;
			this.filesUpload.emit(this.upload);			
		}

	@HostListener('change', ['$event'])
		onChange($event) {
			$event.preventDefault();
			this.filesDropped.emit($event.srcElement.files);

			this.upload = true;
			this.getBase64($event.target.files[0]).then(result => {
				this.upload = true;				
				this.filesUpload.emit(result);							
			})
			.catch(error => {
				this.upload = false;				
				console.log(error);
			})
		}
}
