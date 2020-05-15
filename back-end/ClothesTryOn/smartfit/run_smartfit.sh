#!/bin/bash
set -e

# Script that takes an image of a person and a clothing item and returns an image of the person wearing the clothing to the ./output/ directory.

if [ "$#" -ne 3 ]; then
    echo "ERROR: run_smartfit.sh requires three inputs: relative path to the person image and relative path to the clothing image."
    exit
fi

# Set variables
person_img=$PWD"/"$1
clothing_img=$PWD"/"$2
id=$3

echo "$id"

cd ../back-end/ClothesTryOn/

# Clean directories
rm -f  smartfit/human_parsing/output/*
rm -f  smartfit/pose_estimation/output/*
rm -f  smartfit/try-on/VITON/data/segment/*
rm -f  smartfit/try-on/VITON/data/pose.pkl
rm -f  smartfit/try-on/VITON/data/pose/*
rm -f  smartfit/try-on/VITON/data/women_top/*
rm -rf smartfit/try-on/VITON/results/*
rm -f  smartfit/output/output.png

# Run human parsing
printf "\nRunning human parsing...\n\n"
cd smartfit/human_parsing/
./run_human_parsing.py $person_img

# Run pose estimation
printf "\nRunning pose estimation...\n\n"
cd ../pose_estimation/
python run_pose_estimation.py $person_img --output ../output/

# Move output to target directories in try-on/
cd ../
cp human_parsing/output/*.mat try-on/VITON/data/segment/
cp pose_estimation/output/pose.pkl try-on/VITON/data/
cp pose_estimation/output/*.mat try-on/VITON/data/pose/

# Run try-on
printf "\nRunning image try-on...\n\n"
cd try-on/
./run_try-on.sh $person_img $clothing_img

person_name=$(basename $person_img)
clothing_name=$(basename $clothing_img)
# Copy output to main output directory
cp "VITON/results/stage2/images/${person_name}_${clothing_name}_final.png" "../../../../front-end/public/output/output_$id.png"
echo "\n *******DONEEEEEEEEEEE********** \n"
exit 0
