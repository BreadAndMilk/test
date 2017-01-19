title startProject
set PROJECT_PATH=%~dp0
set RESIN_HOME=C:\Application\Professional\Eclipse\develop\server\resin-3.1.12
set JAVA_HOME=C:\Application\Professional\Eclipse\develop\JDK\jdk1.6.0_45
set HBuilder_WorkSpace=C:\Users\BreadAndMilk\AppData\Roaming\HBuilder\userprofiles\804810596@qq.com
%RESIN_HOME%\httpd.exe -conf %PROJECT_PATH%resin.conf
pause