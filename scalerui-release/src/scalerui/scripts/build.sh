#!/bin/bash

set -x

DEFAULT_AUTOSCALER_CLIENT_SCOPE="cloud_controller.read,cloud_controller.write,uaa.resource,openid,doppler.firehose,scim.read,cloud_controller.admin"

function usage() {
	echo "Usage: $0 [options], example: $0 -ac autoscaler_client_id -as autoscaler_client_secret "
	echo "Options:"
	echo "  -cd 			   - cf domain"
	echo "  -cu 			   - cf user"
	echo "  -cp 			   - cf password"
	echo "  -co 			   - cf org"
	echo "  -cs 			   - cf space"
    echo "  -ac                - autoscaler_client_id"
    echo "  -as                - autoscaler_client_secret"
    echo "  -aso               - autoscaler_client_scope"
    echo "  -curls             - console urls"
    echo "  -host              - scalerui host name"
	exit 1
}

function parse_command_line()
{
    while [ $# -gt 0 ]; do
        OPTION=$1;
        shift
        case ${OPTION} in
            -h)
			    usage
			    exit 1
			;;
            -cd)
                CF_DOMAIN=$1; shift
            ;;
            -cu)
                CF_USER=$1; shift
            ;;
            -cp)
                CF_PASSWORD=$1; shift
            ;;
            -co)
                CF_ORG=$1; shift
            ;;
            -cs)
                CF_SPACE=$1; shift
            ;;
            -ac)
                AUTOSCALER_CLIENT_ID=$1; shift
            ;;
            -as)
                AUTOSCALER_CLIENT_SECRET=$1; shift
            ;;
            -aso)
                AUTOSCALER_CLIENT_SCOPE=$1; shift
            ;;
            -host)
                SCALERUI_HOST=$1; shift
            ;;
            -curls)
                CONSOLE_URLS=$1; shift
            ;;
            *)
                echo "ERROR: Invalid argument $OPTION"; usage; exit 1
            ;;
        esac
    done
    # check parameters provided
    if [ -z "$CF_DOMAIN" ]; then
         echo "ERROR: CF_DOMAIN has not been specified."; usage; exit 1
    fi
    if [ -z "$CF_USER" ]; then
         echo "ERROR: CF_USER has not been specified."; usage; exit 1
    fi
    if [ -z "$CF_PASSWORD" ]; then
         echo "ERROR: CF_PASSWORD has not been specified."; usage; exit 1
    fi
    if [ -z "$CF_ORG" ]; then
         echo "ERROR: CF_ORG has not been specified."; usage; exit 1
    fi
    if [ -z "$CF_SPACE" ]; then
         echo "ERROR: CF_SPACE has not been specified."; usage; exit 1
    fi
    if [ -z "$AUTOSCALER_CLIENT_ID" ]; then
         echo "ERROR: AUTOSCALER_CLIENT_ID has not been specified."; usage; exit 1
    fi
    if [ -z "$AUTOSCALER_CLIENT_SECRET" ]; then
         echo "ERROR: AUTOSCALER_CLIENT_SECRET has not been specified."; usage; exit 1
    fi
    if [ -z "$AUTOSCALER_CLIENT_SCOPE" ]; then
         AUTOSCALER_CLIENT_SCOPE=${DEFAULT_AUTOSCALER_CLIENT_SCOPE}}
    fi
    if [ -z "$SCALERUI_HOST" ]; then
         echo "ERROR: host name of scalerui has not been specified."; usage; exit 1
    fi
    if [ -z "$CONSOLE_URLS" ]; then
         echo "ERROR: console urls have not been specified."; usage; exit 1
    fi
}

parse_command_line "$@"

cd ..

## build go project
git pull && git submodule foreach --recursive git submodule sync && git submodule update --init --recursive
source .envrc
/usr/local/go/bin/go build ./src/scalerui/ui/cmd/ui/main.go
chmod +x main
zip -r -p main.zip ./main

## build nodejs project
cd view
npm install
# npm rebuild node-sass --force
npm run build  

## produce config files
cd ../scripts
cat ./cf_app_config_template.yml \
    | sed "s|<CONSOLE_URLS>|$CONSOLE_URLS|g" \
    | sed "s/<CF_DOMAIN>/$CF_DOMAIN/g" \
    | sed "s/<AUTOSCALER_CLIENT_ID>/$AUTOSCALER_CLIENT_ID/g" \
    | sed "s/<AUTOSCALER_CLIENT_SECRET>/$AUTOSCALER_CLIENT_SECRET/g" \
    | sed "s/<AUTOSCALER_CLIENT_SCOPE>/$AUTOSCALER_CLIENT_SCOPE/g" \
    | sed "s/<SCALERUI_HOST>/$SCALERUI_HOST/g" > ../cf_app_config.yml
    
ruby ./yml2js.rb
cp ./config.js ../view/dev
cd ..
zip -r -p main.zip ./cf_app_config.yml
zip -r -p main.zip ./view/dev

## produce manifest
cat scripts/manifest_template.yml | sed "s/<CF_DOMAIN>/$CF_DOMAIN/g" | sed "s/<SCALERUI_HOST>/$SCALERUI_HOST/g" > manifest.yml

## login and push
cf login -a https://api.${CF_DOMAIN} -u ${CF_USER} -p ${CF_PASSWORD} -o ${CF_ORG} -s ${CF_SPACE} --skip-ssl-validation
cf push