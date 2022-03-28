
 
import { Component, OnInit, EventEmitter, HostListener, Output, Input, DoCheck } from '@angular/core';

@Component({
  selector: 'app-input-upload',
  templateUrl: './input-upload.component.html',
  styleUrls: ['./input-upload.component.css']
})
export class InputUploadComponent implements OnInit, DoCheck {

	@Input() upload!: boolean;
	@Input() input_id!: string;
	@Input() isResetUploadedFile: boolean = false;

	@Output() filesDropped = new EventEmitter<FileList>();
	@Output() filesHovered = new EventEmitter();
	@Output() filesUpload = new EventEmitter();
	@Output() resetFile = new EventEmitter();

  constructor() { }

  ngOnInit() {
	this.input_id = this.input_id ? this.input_id : 'ogp_images';
  }

  ngDoCheck() {
  	if(this.isResetUploadedFile) {
  		this.resetUploadedFile();
  	}
  }

  resetUploadedFile() {
  	let fileObj:any = document.getElementById(this.input_id);
  	if(fileObj) {
  		fileObj.value = "";  		
  	}
  	setTimeout(() => {
  		this.resetFile.emit(true);
  	},500)
  }

    getBase64(file:any) {
	  return new Promise((resolve, reject) => {
	    const reader = new FileReader();
	    reader.readAsDataURL(file);
	    reader.onload = () => resolve(reader.result);
	    reader.onerror = error => reject(error);
	  });
	}	
	
  	@HostListener('drop', ['$event'])
		onDrop($event:any) {
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
		onDragOver($event:any) {
			$event.preventDefault();
			this.filesHovered.emit(true);
			this.upload = false;
			this.filesUpload.emit(this.upload);		
		}

	@HostListener('dragleave', ['$event'])
		onDragLeave($event:any) {
			this.filesHovered.emit(false);		
		}

	@HostListener('click', ['$event'])
		onClick($event:any) {
			console.log("click");
			this.upload = false;
			this.filesUpload.emit(this.upload);			
		}

	@HostListener('change', ['$event'])
		onChange($event:any) {
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
