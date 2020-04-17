#!/bin/bash
#set -x

while true
do
	cd .
	echo $PWD 
	file=temp_base64.jpg
	out=temp.jpg
	echo $file
	if [[ -f "$file" ]]
	then
		base64 --decode $file > $out
		echo $?
		if [[ $? == 0 ]]
		then
			echo "removing file"
			#rm temp.png
			mv $file temp_bkp.jpg
		fi
		echo "file converted"
	else
		echo "file not found"
	fi
	sleep 2
done
