#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main(int argc, char **argv[]) {
	if (argc == 1) {
		printf("%s\n","please input TTeok program dirctory path.");
		return 1;
	}
 	char *env = getenv("$DalToki_PATH");
	char shellScript[1000] = "";
	strcat(shellScript,env);
	strcat(shellScript,"/DalToki.sh ");
	system(strcat(shellScript,argv[1]));
	return 0;
}
