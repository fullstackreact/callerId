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

source $DIR/utils.sh

SCRIPT=`basename ${BASH_SOURCE[0]}`
DM=$(which docker-machine)
D=$(which docker)

if [ -z $DM ]; then
  e_error
  e_error "docker-machine not found"
  e_error
  e_error "Please install docker-machine to continue"
  e_error "See https://docs.docker.com/machine/install-machine/ for details"
  e_error
  exit -1
fi

VERBOSE=false
DRY_RUN=false
SKIP_CONFIRMATION=false
PROVIDER="virtualbox"
CLUSTER_PREFIX="fs"
NET_NAME="${CLUSTER_PREFIX}-net"

SPOT_PRICE=

function HELP {
  e_header "Help documentation"
  e_log "Usage: $0 [options]"
  e_log
  e_log "-p" "provider. Default: ${PROVIDER}"
  e_log "-v" "verbose. Default: ${VERBOSE}"
  e_log "-s" "number of nodes to start. Default: ${NUM_NODES}"
  e_log "-d" "dry run. Default: ${DRY_RUN}"
  e_log "-y" "skip confirmation. Default: ${SKIP_CONFIRMATION}"
  e_log "-n" "name. Default is: ${CLUSTER_PREFIX}"
  e_log "-t" "request spot price. Default: ${SPOT_PRICE}"
  e_log "-h" "Display this help message\n"
  e_log

  exit 1
}

while getopts :vdhp:ys:n:ct: FLAG; do
  case $FLAG in
    v) VERBOSE=true
        ;;
    y) SKIP_CONFIRMATION=true
        ;;
    h) HELP
        ;;
    d) DRY_RUN=true
        ;;
    n) CLUSTER_PREFIX="$OPTARG"
        ;;
    s) NUM_NODES=$OPTARG
        ;;
    t) SPOT_PRICE="$OPTARG"
        ;;
    p)
        if [[ "$OPTARG" != "aws" &&
              "$OPTARG" != "virtualbox" ]]; then
          HELP
        else
          PROVIDER="$OPTARG"
        fi
        ;;
    \?) ;;
  esac
done

DRIVER_OPTIONS=""

if [[ $PROVIDER == "virtualbox" ]]; then
  DISK_SIZE=${DISK_SIZE:-50000}
  MEMORY=${MEMORY:-4096}
  CPU_COUNT=${CPU_COUNT:-2}

  DRIVER_OPTIONS="--driver virtualbox \
                  --virtualbox-disk-size $DISK_SIZE \
                  --virtualbox-memory $MEMORY \
                  --virtualbox-cpu-count $CPU_COUNT"

  e_debug e_header "${NORM}Running ${REV}${BOLD}virtualbox${NORM}"

elif [[ $PROVIDER == "aws" ]]; then
  if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ] || [ -z "$AWS_VPC_ID" ]; then
    echo "Please set your AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_VPC_ID"
    exit 1;
  fi

  AWS_AMI=${AWS_AMI:-"ami-125b2c72"}
  AWS_VPC_ID=${AWS_VPC_ID:-"vpc-c9d848ac"}
  AWS_SUBNET_ID=${SUBNET_ID:-"subnet-9ae9aeff"}
  AWS_REGION=${AWS_REGION:-"us-west-1"}
  AWS_INSTANCE_TYPE=${AWS_INSTANCE_TYPE:-"g2.2xlarge"}
  DISK_SIZE=${DISK_SIZE:-128}

  DRIVER_OPTIONS="--driver amazonec2 \
                  --amazonec2-access-key ${AWS_ACCESS_KEY_ID} \
                  --amazonec2-secret-key ${AWS_SECRET_ACCESS_KEY} \
                  --amazonec2-ami ${AWS_AMI} \
                  --amazonec2-region $AWS_REGION \
                  --amazonec2-vpc-id ${AWS_VPC_ID} \
                  --amazonec2-instance-type ${AWS_INSTANCE_TYPE} \
                  --amazonec2-root-size ${DISK_SIZE}"
                  # --amazonec2-subnet-id $AWS_SUBNET_ID \

  if [[ ! -z "$SPOT_PRICE" ]]; then
    DRIVER_OPTIONS="$DRIVER_OPTIONS \
                    --amazonec2-request-spot-instance \
                    --amazonec2-spot-price $SPOT_PRICE"
  fi
else
  echo "Error"
fi

createMachine $CLUSTER_PREFIX $DRIVER_OPTIONS

if [[ ! $DRY_RUN ]]; then
  while ! nc -vz $($DM ip $CLUSTER_PREFIX) 22 -w 5 2>/dev/null; do
    sleep 2
  done
fi

R_DIR=/usr/local/src
