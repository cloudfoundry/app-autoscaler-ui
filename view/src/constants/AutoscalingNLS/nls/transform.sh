#!/bin/bash

IFS_old=$IFS
IFS=$'\n'

filename=$1

for line in `cat $filename`
do
  if [[ -n `echo $line | grep "<" | grep "'"` ]]
    then
    echo $line | sed 's/${/{/g' >> $filename.transform
  else
    count=$(echo $line | grep -o "'" | wc -l)
    extra=$((count%2))
    if [[ $extra -eq 1 ]]
      then
      echo $line | sed "s/\'/\\\'/g" | tr '"' "'" | sed 's/${/{/g' >> $filename.transform
    else
      echo $line | tr '"' "'" | sed 's/${/{/g' >> $filename.transform
    fi
  fi
done

cat $filename > $filename.oringinal
cat $filename.transform > $filename
rm -f $filename.transform


# important
# cat messages.properties | grep -v "^#" | grep -v "^$" | sed "s/\'/\\\'/g" | sed "s/=/: '/g" | sed "s/$/'/g"

sed -i 1 's/{value_min_[a-zA-Z]*}/{value_min}/' ScalingMessages.js
sed -i 1 's/{value_max_[a-zA-Z]*}/{value_max}/' ScalingMessages.js



