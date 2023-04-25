import { google } from 'googleapis';
import { environment } from 'src/environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";

/*
 * Browse the link below to see the complete object returned for folder/file creation and search
 *
 * @link https://developers.google.com/drive/api/v3/reference/files#resource
 */
type PartialDriveFile = {
  id: string;
  name: string;
};

type SearchResultResponse = {
  kind: 'drive#fileList';
  nextPageToken: string;
  incompleteSearch: boolean;
  files: PartialDriveFile[];
};

export class GoogleDriveService {

  driveClientId = environment.gdrive.GOOGLE_DRIVE_CLIENT_ID || '';
  driveClientSecret = environment.gdrive.GOOGLE_DRIVE_CLIENT_SECRET || '';
  driveRedirectUri = environment.gdrive.GOOGLE_DRIVE_REDIRECT_URI || '';
  driveRefreshToken;// = environment.gdrive.GOOGLE_DRIVE_REFRESH_TOKEN || '';
  private driveClient;

  public constructor(private http: HttpClient) {
    // this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken);
    this.driveClient = this.createDriveClient();
  }

  createDriveClient() {
    const client = new google.auth.OAuth2(this.driveClientId, this.driveClientSecret, this.driveRedirectUri);

    // client.setCredentials({ refresh_token: refreshToken });

    return google.drive({
      version: 'v3',
      auth: client,
    });
  }

  createFolder(folderName: string): Promise<PartialDriveFile> {
    return this.driveClient.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      },
      fields: 'id, name',
    });
  }

  searchFolder(folderName: string): Promise<PartialDriveFile | null> {
    const driveId = '0AK1-Qhm_r1YrUk9PVA';

    return new Promise((resolve, reject) => {
      this.driveClient.files.list(
        {
          q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
          fields: 'files(id, name)',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
          // driveId: driveId,
        },
        (err, res: { data: SearchResultResponse }) => {
          if (err) {
            return reject(err);
          }

          return resolve(res.data.files ? res.data.files[0] : null);
        },
      );
    });
  }

  //This is used to save file on the drive. Not needed for now
  // saveFile(fileName: string, filePath: string, fileMimeType: string, folderId?: string) {
  //   return this.driveClient.files.create({
  //     requestBody: {
  //       name: fileName,
  //       mimeType: fileMimeType,
  //       parents: folderId ? [folderId] : [],
  //     },
  //     media: {
  //       mimeType: fileMimeType,
  //       body: fs.createReadStream(filePath),
  //     },
  //   });
  // }

  async saveExcel(fileName: string, fileUrl: string, fileMimeType: string, folderId?: string) {

    // const got = await import('got');
    const headers = new HttpHeaders();
    this.http.get(fileUrl,{headers, responseType: 'blob' as 'json'}).subscribe(
      (response: any) =>{
        let dataType = response.type;
        let binaryData = [];
        binaryData.push(response);
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
        // if (filename)
        //   downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
      }
    )
    const fileMetadata = {
      name: fileName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    };

    const driveId = '0AK1-Qhm_r1YrUk9PVA';

    return this.driveClient.files.create({
      resource: fileMetadata,
      requestBody: {
        name: fileName,
        mimeType: fileMimeType,
        parents: folderId ? [folderId] : [],
      },
      media: {
        mimeType: fileMimeType,
        //TODO: add correct stream data
        // body:got.default.stream(fileUrl),
      },
      supportsAllDrives: true,
      driveId: driveId,
    });
  }

  getUserConsent(){
    let url = `https://accounts.google.com/o/oauth2/auth?client_id=${this.driveClientId}&redirect_uri=${this.driveRedirectUri}&response_type=code`;//&scope=${scope}
    this.http.get(url).subscribe((res: any) => {
      console.log(res);
    });
  }

  async createExcelOnDrive(fileUrl: string) {
    // const googleDriveService = new GoogleDriveService();

    const folderName = 'Parser';

    let folder = await this.searchFolder(folderName).catch((error) => {
      console.error(error);
      return null;
    });

    console.log('creating folder');
    if (!folder) {
      folder = await this.createFolder(folderName);
    }

    console.log('remote file:', fileUrl);

    console.log('saving to drive');
    let createdFile = await this.saveExcel('Zerodha.xlsx', fileUrl, 'application/vnd.google-apps.spreadsheet', folder.id).catch((error) => {
      console.error(error);
    });

    let redirectUrl = 'https://docs.google.com/spreadsheets/d/' + createdFile.data.id;
    console.info('File uploaded successfully!', createdFile);
    console.info('File available at', redirectUrl);

    window.open(redirectUrl);
  }
}
