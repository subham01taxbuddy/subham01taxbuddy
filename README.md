# Taxbuddy

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.


## SonarQube Integration In Angular Project Steps-
1.Download and install Java 17 on your system(https://www.oracle.com/in/java/technologies/downloads/#jdk20-mac)
2.set java home path properly(run java --version to check if path is set properly or not)
3.Download the SonarQube Community Edition zip file(https://www.sonarsource.com/products/sonarqube/downloads/)
4.Unzip SonarQube in root (c drive)
5.got to C:\sonarqube-10.0.0.68432\bin\macosx-universal-64 and start server
6.go to http://localhost:9000/
7.first time username & password is admin
8.after login create project manually & continue then generate token 
9.download sonar scanner(https://docs.sonarqube.org/10.0/analyzing-source-code/scanners/sonarscanner/) 
10.Unzip anywhere set scanner path in env variables 
11.copy the token and project name ,key and paste it in root of project(run in terminal/cmd) which we want to scan 
12.once analysis is completed you can check it in dashboard

13.Reference links - https://www.youtube.com/watch?v=3dLVHViflys ,https://docs.sonarqube.org/latest/try-out-sonarqube/  ,
