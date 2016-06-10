#!/bin/bash

## LIBRARY FUNCTION -- just gotta copy+paste
# http://stackoverflow.com/questions/59895/can-a-bash-script-tell-what-directory-its-stored-in
SOURCE="${BASH_SOURCE[0]}"
while [ -h "$SOURCE" ]; do
  DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
  SOURCE="$(readlink "$SOURCE")"
  [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
done
DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"

bold=$(tput bold)
underline=$(tput sgr 0 1)
reset=$(tput sgr0)

purple=$(tput setaf 171)
red=$(tput setaf 1)
green=$(tput setaf 76)
tan=$(tput setaf 3)
blue=$(tput setaf 38)

#
# Headers and  Logging
#

e_log() {
  note=$1
  append=$2

  msg="\n${bold}$1${reset}"

  if [ "$append" != "" ]; then
    msg="$msg $2"
  fi

  printf "$msg"
}

e_debug() {
  verbose=$VERBOSE

  if [[ $verbose != false ]]; then
    "${@}\n"
  fi
}

e_verbose() {
  verbose=$1

  if [[ $verbose != false ]]; then
    "${@}"
  fi
}

e_header() {
  printf "\n${bold}${purple}==========  %s  ==========${reset}\n" "$@"
}
e_arrow() {
  printf "➜ $@\n"
}
e_success() {
  printf "${green}✔ %s${reset}\n" "$@"
}
e_error() {
  printf "${red}✖ %s${reset}\n" "$@"
}
e_warning() {
  printf "${tan}➜ %s${reset}\n" "$@"
}
e_underline() {
  printf "${underline}${bold}%s${reset}\n" "$@"
}
e_bold() {
  printf "${bold}%s${reset}\n" "$@"
}
e_note() {
  printf   "${underline}${bold}${blue}Note:${reset}  ${blue}%s${reset}\n" "$@"
}

get_confirmation() {
  if [ $SKIP_CONFIRMATION != true ]; then
    printf "\n${bold}$@${reset}"
    read -p " (y/n) " -n 1
    printf "\n"
  fi
}

# Test whether the result of an 'ask' is a confirmation
is_confirmed() {
  if [ $SKIP_CONFIRMATION == true ] || [[ "$REPLY" =~ ^[Yy]$ ]]; then
    return 0
  fi
  return 1
}

type_exists() {
  if [ $(type -P $1) ]; then
    return 0
  fi
  return 1
}

is_os() {
  if [[ "${OSTYPE}" == $1* ]]; then
    return 0
  fi
  return 1
}

getName() {
  # return 0
  local _outvar=$1
  local _result="$CLUSTER_PREFIX$2"

  eval $_outvar=\$_result
}

createMachine() {
  local _name=$1
  local _options=${@:2}

  local _status
  dmStatus _status $_name

  if [[ $DRY_RUN ]]; then
    e_log "Calling createMachine"
    e_log "$DM create $_options $_name"
    e_log
    e_log
  else
    if [[ $_status -eq 1 ]]; then
      get_confirmation "Launch the machine $_name"
      if is_confirmed; then
        $DM create $_options $_name
      else
        e_error "Not creating machine due to cli rejection"
      fi
    fi
  fi
}

launchContainer() {
  local _outvar=$1
  local _name=$2
  local _options=${@:3}

  local _containerId
  dockerId _containerId $_name

  local _containerStatus=false
  if [ "$_containerId" != "" ]; then
    containerStatus _containerStatus $_containerId
  fi

  if [ "$_containerStatus" != true ]; then
    get_confirmation "Run docker container $_name"
    if is_confirmed; then
      CMD="$D run -d \
              -h $_name \
              --name=$_name \
              $_options"

      e_debug e_log "cmd: $CMD"
      _containerId=$($CMD)
    else
      e_error "Not launching docker instance due to cli rejection"
    fi
  fi
  eval $_outvar=$_containerId
}

dmStatus() {
  local _outvar=$1
  local _name=$2
  $DM status $_name &> /dev/null
  eval $_outvar=\$?
}

dockerId() {
  local _outvar=$1
  local _name=$2

  local _container=$($D ps | grep $_name)

  if [[ "$_container" != "" ]]; then
    local _id=$(echo "$_container" | awk '{print $1}')
    eval $_outvar=\$_id
  else
    e_debug e_error "No container found with name $_name"
    return 1
  fi
}

## Status of a container by id
containerStatus() {
  local _outvar=$1
  local _containerId=$2

  if [[ $_containerId == 1 ]]; then
    eval $_outvar=1
  else
    local _status=$($D inspect --format="{{ .State.Running }}" $_containerId)
    eval $_outvar=$_status
  fi
}

dmIp() {
  local _outvar=$1
  local _name=$2
  local _eth=${3:-docker0}

  local _res=$($DM ip $_name)
  eval $_outvar=\$_res
}

dmInternalIp() {
  local _outvar=$1
  local _name=$2
  local _eth=${3:-docker0}

  local _res=$($DM ssh $_name "ifconfig $_eth | grep \"inet addr:\" | cut -d: -f2 | cut -d\" \" -f1")
  eval $_outvar=\$_res
}


dmi() {
  local _name=$1

  e_debug echo "Launching: $DM env $_name"
  eval $($DM env $_name)
}

networkStatus() {
  local _outvar=$1
  local _netName=$2

  local _status=$($D network inspect --format="{{ .Name }}" $_netName)
  eval $_outvar=$_status
}

createNetwork() {
  local _name=$1
  local _subnet=${2:-10.0.9.0/24}

  local _status
  networkStatus _status $_name

  if [ "$?" != 0 ]; then
    $D network create \
      --driver overlay \
      --subnet=$_subnet \
      $_name
  fi
}
