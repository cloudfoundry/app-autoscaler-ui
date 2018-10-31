package models

import (
	"time"
)

type OrderType uint8

const (
	DESC OrderType = iota
	ASC
)
const (
	DESCSTR string = "DESC"
	ASCSTR  string = "ASC"
)

type ErrorResponse struct {
	Code        string `json:"code"`
	Description string `json:"description"`
}

type TLSCerts struct {
	KeyFile    string `yaml:"key_file" json:"keyFile"`
	CertFile   string `yaml:"cert_file" json:"certFile"`
	CACertFile string `yaml:"ca_file" json:"caCertFile"`
}

type CCEndpoints struct {
	AuthEndpoint string `json:"authorization_endpoint"`
}

type UAAToken struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
	TokenExpiry  int64
}

func (uaaToken UAAToken) IsExpired() bool {
	// expTime := time.Unix(uaaToken.TokenExpiry, 0)
	// return expTime.Before(time.Now().Add(1 * time.Minute))
	return uaaToken.TokenExpiry < time.Now().Add(1*time.Minute).Unix()
}

type JWTUserTokenInfo struct {
	UserGUID    string   `json:"user_id"`
	UserName    string   `json:"user_name"`
	TokenExpiry int64    `json:"exp"`
	Scope       []string `json:"scope"`
}

type StateInfo struct {
	RequestMethod    string `json:"request_method"`
	QueryString      string `json:"query_string"`
	RedirectUrl      string `json:"redirect_url"`
	BackUrl          string `json:"back_url"`
	TokenEndpoint    string `json:"token_endpoint"`
	UserInfoEndpoint string `json:"userinfo_endpoint"`
	CCEndpoint       string `json:"cc_endpoint"`
	OrgId            string `json:"org_id"`
	SpaceId          string `json:"space_id"`
	AppId            string `json:"app_id"`
	ErrorPage        string `json:"error_page"`
}

//=======
// {
//   "metadata": {
//     "guid": "c624a616-fbdb-4966-85b0-4798a5e9abf2",
//     "url": "/v2/apps/c624a616-fbdb-4966-85b0-4798a5e9abf2",
//     "created_at": "2018-04-16T09:26:00Z",
//     "updated_at": "2018-05-17T03:24:29Z"
//   },
//   "entity": {
//     "name": "qiye",
//     "production": false,
//     "space_guid": "36731dfd-99b5-4495-8451-84d2100d575f",
//     "stack_guid": "fa7671cb-5622-43b6-8ea0-1218e4729754",
//     "buildpack": null,
//     "detected_buildpack": "nodejs",
//     "detected_buildpack_guid": "e7e444d8-0385-408f-a876-29e653056b05",
//     "environment_json": {

//     },
//     "memory": 256,
//     "instances": 10,
//     "disk_quota": 1024,
//     "state": "STARTED",
//     "version": "d90386c9-19b3-4730-ab3d-ab4ab4e37154",
//     "command": null,
//     "console": false,
//     "debug": null,
//     "staging_task_id": "a35c0c14-9661-4de8-9322-6f175630a5aa",
//     "package_state": "STAGED",
//     "health_check_type": "port",
//     "health_check_timeout": null,
//     "health_check_http_endpoint": null,
//     "staging_failed_reason": null,
//     "staging_failed_description": null,
//     "diego": true,
//     "docker_image": null,
//     "docker_credentials": {
//       "username": null,
//       "password": null
//     },
//     "package_updated_at": "2018-04-16T09:26:00Z",
//     "detected_start_command": "npm start",
//     "enable_ssh": true,
//     "ports": [
//       8080
//     ],
//     "space_url": "/v2/spaces/36731dfd-99b5-4495-8451-84d2100d575f",
//     "stack_url": "/v2/stacks/fa7671cb-5622-43b6-8ea0-1218e4729754",
//     "routes_url": "/v2/apps/c624a616-fbdb-4966-85b0-4798a5e9abf2/routes",
//     "events_url": "/v2/apps/c624a616-fbdb-4966-85b0-4798a5e9abf2/events",
//     "service_bindings_url": "/v2/apps/c624a616-fbdb-4966-85b0-4798a5e9abf2/service_bindings",
//     "route_mappings_url": "/v2/apps/c624a616-fbdb-4966-85b0-4798a5e9abf2/route_mappings"
//   }
// }
//=======
type ApplicationEntity struct {
	Name      string `json:"name"`
	Memory    int    `json:"memory"`
	Instances int    `json:"instances"`
	State     string `json:"state"`
}
type CCApplicationInfo struct {
	Entity ApplicationEntity `json:"entity"`
}

//==============================================================
// {
//   'app_guid': '4db90d35-ee90-4c91-a54a-cb79dc65d686',
//   'app_name': 'node1',
//   'state': 'STARTED',
//   'app_type': 'nodejs',
//   'instances': 2,
//   'memory_quota': 256000000
// }
//==============================================================
type Application struct {
	AppGuid     string `json:"app_guid"`
	AppName     string `json:"app_name"`
	Instances   int    `json:"instances"`
	State       string `json:"state"`
	MemoryQuota int    `json:"memory_quota"`
}
type ApplicationResponse struct {
	Applications []Application `json:"applications"`
}

//==================service binding response====================
// {
//   "total_results": 1,
//   "total_pages": 1,
//   "prev_url": null,
//   "next_url": null,
//   "resources": [
//     {
//       "metadata": {
//         "guid": "83a87158-92b2-46ea-be66-9dad6b2cb116",
//         "url": "/v2/service_bindings/83a87158-92b2-46ea-be66-9dad6b2cb116",
//         "created_at": "2016-06-08T16:41:30Z",
//         "updated_at": "2016-06-08T16:41:26Z"
//       },
//       "entity": {
//         "app_guid": "31809eda-4bdd-44fc-b804-eefe662b3a98",
//         "service_instance_guid": "92d707ce-c06c-421a-a1d2-ed1e750af650",
//         "credentials": {
//           "creds-key-48": "creds-val-48"
//         },
//         "binding_options": {

//         },
//         "gateway_data": null,
//         "gateway_name": "",
//         "syslog_drain_url": null,
//         "volume_mounts": [

//         ],
//         "app_url": "/v2/apps/31809eda-4bdd-44fc-b804-eefe662b3a98",
//         "service_instance_url": "/v2/service_instances/92d707ce-c06c-421a-a1d2-ed1e750af650"
//       }
//     }
//   ]
// }

//==============================================================
type ServiceBindingEntity struct {
	AppGuid string `json:"app_guid"`
	AppUrl  string `json:"app_url"`
}
type Resource struct {
	Entity ServiceBindingEntity `json:"entity"`
}
type ServiceBinding struct {
	TotalResults int        `json:"total_results"`
	TotalPages   int        `json:"total_pages"`
	Resources    []Resource `json:"resources"`
}

type PublicInfo struct {
	Version string `json:"version"`
	Uptime  string `json:"uptime"`
}
type PublicHealthError struct {
	CloudfoundryAutoscaler          string `json:"cloudfoundry_autoscaler"`
	CloudfoundryAutoscalerTimestamp string `json:"cloudfoundry_autoscaler_timestamp"`
}
type PublicHealth struct {
	Status bool              `json:"status"`
	Error  PublicHealthError `json:"error"`
}
