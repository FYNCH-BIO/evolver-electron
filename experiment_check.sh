#!/bin/sh
#Background bash script to continously check for experiment processes and re-launch those that are unintentionally killed
#Every 10 seconds the script checks for running eVOLVER.py processes and stores found running processes in RUNNING
#Processes in RUNNING are then checked against runningExpts.txt file, which describes any experiments either running through the eVOLVER app or those that were running before app closed
#Experiments found in runningExpts.txt but not in RUNNING are then re-launched

while true; do
  IFS=$'\n'
  RUNNING=($(ps -ax | grep "eVOLVER.py" | tr -s " " | cut -d " " -f 5-))
  length=${#RUNNING[@]}
  input="./runningExpts.txt"
  while IFS= read -r line; do
    temp=0
    for (( i = 1; i < $length; i++ )); do
      if [ "$line" != "${RUNNING[i]}" ]; then
        temp+=1
      fi
    done
    if [ $temp -eq $((${#RUNNING[@]} - 1)) ]; then
      echo "Relaunching Experiment"
      experiment=$(echo $line | sed "s/p {/p '{/" | sed "s/0}/0}'/" | sed "s/-c n/-c y/")
      filedirname=$(echo $experiment | cut -d " " -f 1,2)
      args=$(echo $experiment | cut -d " " -f 3-)
      ARGS=($(echo $args | tr " " "\n"))
      python3 $filedirname ${ARGS[0]} ${ARGS[1]} ${ARGS[2]} ${ARGS[3]} ${ARGS[4]} ${ARGS[5]} ${ARGS[6]} ${ARGS[7]} ${ARGS[8]} ${ARGS[9]} ${ARGS[10]} ${ARGS[11]} ${ARGS[12]} ${ARGS[13]} ${ARGS[14]} ${ARGS[15]} &
    fi
  done < "$input"
  sleep 10
done
