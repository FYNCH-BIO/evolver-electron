#!/bin/sh
#Background bash script to continously check for experiment processes and re-launch those that are unintentionally killed
#Every 30 seconds the script is called by a job scheduler to check for running eVOLVER.py processes and stores found running processes in RUNNING
#Processes in RUNNING are then checked against runningExpts.txt file, which describes any experiments either running through the eVOLVER app or those that were running before app closed
#Experiments found in runningExpts.txt but not in RUNNING are then re-launched

# Edit path to runningExpts.txt via config.sh file

source config.sh

IFS=$'\n'
running=($(ps -ax | grep "eVOLVER.py" | tr -s " " | cut -d " " -f 5-))
length=${#running[@]}
while IFS= read -r line; do
  temp=0
  for (( i = 1; i < $length; i++ )); do
    if [ "$line" != "${running[i]}" ]; then
      temp+=1
    fi
  done
  if [ $temp -eq $((${#running[@]} - 1)) ]; then
    echo "Relaunching Experiment"
    experiment=$(echo $line | sed "s/p {/p '{/" | sed "s/0}/0}'/" | sed "s/-c n/-c y/")
    filedirname=$(echo $experiment | cut -d " " -f 1,2)
    args=$(echo $experiment | cut -d " " -f 3-)
    args=($(echo $args | tr " " "\n"))
    python3 $filedirname ${args[0]} ${args[1]} ${args[2]} ${args[3]} ${args[4]} ${args[5]} ${args[6]} ${args[7]} ${args[8]} ${args[9]} ${args[10]} ${args[11]} ${args[12]} ${args[13]} ${args[14]} ${args[15]} &
  fi
done < "$RUNNING_EXPTS_PATH"
