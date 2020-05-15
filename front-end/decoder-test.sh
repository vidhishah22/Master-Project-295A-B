#!/bin/bash
#set -x

while true
do
	cd .
	echo $PWD 
	file=example_person.jpg
	out=temp.jpg
	echo $file
	if [[ -f "$file" ]]
	then
		base64 --decode $file > $out
		echo $?
		if [[ $? == 0 ]]
		then
			convert $out -alpha off temp_noalpha.jpg
			echo "removing file"
			#rm temp.png
			# mv $file temp_base64_bkp.jpg
			mv $out temp_bkp.jpg
		fi
		echo "file converted"
	else
		echo "file not found"
	fi
	sleep 2
done
