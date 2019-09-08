
// console.log(decimal(test2,4));
var data = null;
var username;

let pre = document.getElementsByTagName('pre')[0];



// var contract_code='playerworld5';
// var contract_scope='playerworld5';
// var contract_currency='XSK';
// var chainId='e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';
// const rpc = new eosjs_jsonrpc.JsonRpc('https://jungle2.cryptolions.io');
// const rpc2 = new eosjs_jsonrpc.JsonRpc('https://jungle2.cryptolions.io');
var contract_code='expc11111111';
var contract_scope='expc11111111';
var contract_currency='EXPC';
var chainId='e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';
const rpc = new eosjs_jsonrpc.JsonRpc('https://eos.greymass.com');
const rpc2 = new eosjs_jsonrpc.JsonRpc('https://eos.greymass.com');

let user_list=new Array();


// mainnet
// var chainId = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';
var endpoint = 'https://nodes.get-scatter.com';

// kylin
// var chainId = '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191';
// var endpoint = 'https://api-kylin.eosasia.one';

var eos = Eos({
    keyProvider: '',
    httpEndpoint: endpoint,
    chainId: chainId,
});

var network = null;
var identity = null;
var currentAccount = null;

function checkoutNetworks() {
    var httpEndpoint = endpoint.split('://');
    var host = httpEndpoint[1].split(':');

    network = {
        blockchain: 'eos',
        host: host[0],
        port: host.length > 1 ? host[0] : (httpEndpoint[0].toLowerCase() == 'https' ? 443 : 80),
        chainId: chainId,
        protocol: httpEndpoint[0],
        httpEndpoint : endpoint,
    };

    console.log(`NETWORK：${JSON.stringify(network)}`);
}

function hasScatter() {
    return scatter !== undefined;
}

function getAccountName() {
    return identity == null || identity.accounts == null || identity.accounts[0].name;
}

function checkAccount() {
    try {
        eos.getAccount({ account_name: getAccountName() }).then(res => {
            var cb = res.core_liquid_balance;
            balance = res.length == 0 ? 0 : new Number(cb.split(' ')[0]).valueOf();
            console.log(getAccountName()+', '+cb);

            var cl = res.cpu_limit;
            cpuAvailable = new Number((cl.available * 100 / cl.max)).toFixed(2) + '%';
            console.log(cpuAvailable);
            hasCPU = cl.available > 0 && ((cl.available / cl.max) >= 0.1);

            ramAvailable = new Number((res.ram_usage * 100 / res.ram_quota)).toFixed(2) + '%';
            console.log(ramAvailable);

            // setTimeout(checkAccount, 1000);
        }).catch(err => {
            console.log(`err：${JSON.stringify(err)}`);
            // setTimeout(checkAccount, 1000);
        });
    } catch (error) {
        console.log(`err：${JSON.stringify(error)}`);
        // setTimeout(checkAccount, 1000);
    }
}

function open(successCallback, errorCallbak) {
    // console.log(';2222');

    let that = this;
    if (!hasScatter()) {
        errorCallbak("scatter required");
        return;
    }
    checkoutNetworks();
    scatter.suggestNetwork(network).then(() => {
        const requirements = { accounts: [network] };
        scatter.getIdentity(requirements).then(
            function (i) {
                if (!i) {
                    return errorCallbak(null);
                }
                identity = i;
                currentAccount = identity.accounts[0];
                // console.log('identity',identity);
                // console.log(identity.accounts[0].name);
                // eos = scatter.eos(network, Eos, { expireInSeconds: 60 }, "https");
                successCallback();
                $("#login_input").val(currentAccount.name);
                login();
            }
        ).catch(error => {
            errorCallbak(error);
        });
    }).catch(error => {
        errorCallbak(error);
    });
}



function scatter_login() {
    if (!hasScatter()) {
        console.log('scatter required');
        return;
    }
    scatter.connect('SAMPLE').then(connected => {
        console.log('connected',connected);
        open(function () {
            // alert(`${JSON.stringify(identity)}`);
            // console.log(`${JSON.stringify(identity)}`);
            // checkAccount();
        }, function (error) {
            // console.log(`${JSON.stringify(error)}`);
        });
    });
}

function scatter_logout() {
    console.log(identity);
    if (identity) {
        // console.log(identity);
        identity = null;
        if (hasScatter()) {
            scatter.forgetIdentity().then(() => {
                console.log('logout success');
            });
        }
    }
}

function cleanscatter() {
    if (hasScatter()) {
        scatter.connect('SAMPLE').then(connected => {
            scatter.forgetIdentity().then(() => {
                console.log('logout success');
            });
        });
    }
}
function open2(successCallback, errorCallbak) {

    let that = this;
    if (!hasScatter()) {
        errorCallbak("scatter required");
        return;
    }
    checkoutNetworks();
    scatter.suggestNetwork(network).then(() => {
        const requirements = { accounts: [network] };
        scatter.getIdentity(requirements).then(
            function (i) {
                if (!i) {
                    return errorCallbak(null);
                }
                identity = i;
                currentAccount = identity.accounts[0];
                (async () => {
                    try {
                        const  users = await rpc2.get_table_rows({
                            code: contract_code,
                            table: 'users',
                            scope: contract_scope,
                        });
                        var account_s=null;
                        var s=users.rows;
                        for ( var i = 0; i <s.length; i++){
                            if(s[i]['account']==identity.accounts[0].name){
                                account_s='1';
                            }
                        }
                        console.log(account_s);
                        if(account_s=='1'){
                            successCallback();
                            tran2($("#tran_eos_price").val());
                        }else{
                            console.log(vm.languageCon.account_not);
                            // scatter_up();
                            layer.open({
                                content: vm.languageCon.account_not,
                                skin: 'msg',
                                time: 3
                            });
                        }
                    } catch (e) {
                        console.log(e);
                    }
                })();
            }
        ).catch(error => {
            errorCallbak(error);
        });
    }).catch(error => {
        errorCallbak(error);
    });
}
// 转账
function transfer(obj){
    var price=$(obj).data('price');
    $("#tran_eos_price").val('');
    $("#tran_eos_price").val(price);
    scatter.connect('SAMPLE').then(connected => {
        console.log('connected',connected);
        open2(function () {

        }, function (error) {

        });
    });
}
function tran2(p) {
    if (currentAccount == null) {

    }

    if(memo==undefined || memo=='' || memo==null){
        memo='';
    }
    // console.log('memo',memo);
    // console.log('price',p);
    var eos = scatter.eos(network, Eos);

    eos.transaction({
        actions: [
            {
                account: 'eosio.token',
                name:    'transfer',
                authorization: [{
                    actor:      currentAccount.name,
                    permission: currentAccount.authority
                }],
                data: {
                    from: currentAccount.name,
                    to: contract_code,
                    quantity: p,
                    memo: memo
                }
            }
        ]
    }).then(result => {
        // alert('success!');
    }).catch(error => {
        // alert('error:'+JSON.stringify(error));
    });
}
function transfer2(obj){
    var price=$(obj).data('price');
    // console.log(price);

    // scatter_up();
    if (currentAccount == null) {
        // scatter_up();
    }
    var eos = scatter.eos(network, Eos);
    console.log(eos);

    eos.transaction({
        actions: [
            {
                account: 'eosio.token',
                name:    'transfer',
                authorization: [{
                    actor:      currentAccount.name,
                    permission: currentAccount.authority
                }],
                data: {
                    from: currentAccount.name,
                    to: contract_code,
                    quantity: '0.0001 EOS',
                    memo: memo
                }
            }
        ]
    }).then(result => {
        // alert('success!');
    }).catch(error => {
        // alert('error:'+JSON.stringify(error));
    });

}


var memo=null;
var request_params=GetRequest();
if(request_params.memo==''){
    $("#tran_memo").attr('value','');
}else{
    if(getSession('user') != request_params.memo){
        memo=request_params.memo;
        $("#tran_memo").attr('value',request_params.memo);
    }
}
user_lists();

var userAgentInfo = navigator.userAgent;
// $(".userAgent").html(userAgentInfo+"_____"+IsPC());
// console.log(userAgentInfo);
// console.log(IsPC());

function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

function user_lists() {
    // var test_arr=[1,2,3,4,5];
    // console.log(test_arr.includes(2));
    (async () => {
        try {
            const  users = await rpc2.get_table_rows({
                code: contract_code,
                table: 'users',
                scope: contract_scope,
                // upper_bound: user_sess
            });
            var s=users.rows;
            for ( var i = 0; i <s.length; i++){
                // user_list['name']=s[i]['account'];
                user_list.push(s[i]['account']);
                // user_list2 = user_list2 + s[i]['account']+',';
            }
        } catch (e) {
            console.log(e);
        }
    })();
}

load_index();
console.log(user_list);

function mature_quantity() {
    (async () => {
        try {
            const  mature = await rpc2.get_table_rows({
                code: contract_code,
                table: 'mature',
                scope: contract_scope,
            })
            var quantity=0;
            var s=mature.rows;
            for ( var i = 0; i <s.length; i++){
                var join =s[i]['quantity'].split(' ');
                var num=join[0];
                // console.log(num);
                quantity=Number(num)+quantity ;
            }
            // console.log(quantity);
            $("#mature_quantity").html(decimal(quantity/10000,1));
        } catch (e) {
            console.log(e);
        }
    })();
}


$("#scatter_login").click(function () {
    // scatter_up();
})

function login_up_page() {
    var user_sess=getSession('user');
    if(user_sess){

    }else{
        $("#alert_login").show();
        $("#alert_tran").hide();
    }
}
function login_up_scatter() {
    scatter_up()
}

function hasScatter() {
    return scatter !== undefined;
}
function scatter_status() {
    scatter.connect('SAMPLE').then(connected => {
        if(connected){
            // console.log('scatter_login');
            $(".login_username_action").attr('onclick','scatter_up()');
            $(".nodetype3 li").attr('onclick','transfer(this)');
        }else{
            // console.log('login_username');
            $(".login_username_action").attr('onclick','login_up_page()');
        }
    });

}


function scatter_up() {
    if (!hasScatter()) {
        // alert('scatter required');
        return;
    }
    scatter.connect('SAMPLE').then(connected => {
        console.log('connected',connected);
        open(function () {

        }, function (error) {

        });
    });


}

function stat_supply() {
    (async () => {
        try {
            const  stat = await rpc2.get_table_rows({
                code: contract_code,
                table: 'stat',
                scope: contract_currency,
            })
            var stat_supply=stat['rows'][0]['supply'];
            var join =stat_supply.split(' ');
            var s=decimal(join[0]/100000000,2);
            $("#stat_supply").html(s);
            // console.log(s);
        } catch (e) {
            console.log(e);
        }
    })();
}


function decimal(number,n){
    n = n ? parseInt(n) : 0;
    if(n <= 0) {
        return Math.round(number);
    }
    number = Math.round(number * Math.pow(10, n)) / Math.pow(10, n);
    number = Number(number).toFixed(n);
    return number;


}

function rounds1() {
    (async () => {
        try {
            const ret = await rpc2.get_table_rows({
                code: contract_code,
                table: 'rounds1',
                scope: contract_scope,
            })

            rounds1_data(ret);

        } catch (e) {
            console.log(e);
        }
    })();
}

//nodetype3
function nodetype3() {
    (async () => {
        try {
            const ret23 = await rpc2.get_table_rows({
                code: contract_code,
                table: 'nodetype3',
                scope: contract_scope,
            })
            nodetype3_data(ret23);
            // getTableRows(ret);
        } catch (e) {
            console.log(e);
        }
    })();
}

//expcinfo2
function expcinfo2() {
    (async () => {
        try {
            const ret2 = await rpc2.get_table_rows({
                code: contract_code,
                table: 'expcinfo2',
                scope: contract_scope,
            })

            expcinfo2_data(ret2);
            // getTableRows(ret);

        } catch (e) {
            console.log(e);
        }
    })();
}

function expcinfo2_data(data){
    var today_price_eos, next_price_eos, total_mining, total_reward;
    today_price_eos=data['rows'][0]['today_price_eos'];
    next_price_eos=data['rows'][0]['next_price_eos'];
    total_mining=data['rows'][0]['total_mining'];
    total_reward=data['rows'][0]['total_reward'];
    $("#today_price_eos").html(decimal(today_price_eos,4)+' EOS');
    $("#next_price_eos").html(decimal(next_price_eos,4)+' EOS');
    $("#total_mining").html(total_mining);
    $("#total_reward").html(total_reward);
    // console.log(data);
    // console.log(data['rows'][0]['account']);
}
$("#login_username2").click(function () {
    var user_sess=getSession('user');
    if(user_sess){

    }else{
        $("#alert_login").show();
        $("#alert_tran").hide();
    }
})



function accounts(user_sess) {
    //accounts
    (async () => {
        try {
            const  accounts = await rpc2.get_table_rows({
                code: contract_code,
                table: 'accounts',
                scope: user_sess,
            })
            var balance=accounts['rows'][0]['balance'];
            $("#expc_balance").html(balance);
            // console.log(balance);
        } catch (e) {
            console.log(e);
        }
    })();
}
function accountsm(user_sess) {
    (async () => {
        try {
            const  accountsm = await rpc2.get_table_rows({
                code: contract_code,
                table: 'accountsm',
                scope: user_sess,
            })
               console.log(accountsm['rows']);
            if(accountsm['rows'].hasOwnProperty('balance')){
                var balance=accountsm['rows'][0]['balance'];
                $("#user_accountsm").html(balance);
            }
            // console.log(accountsm['rows'].hasOwnProperty('balance'));
        } catch (e) {
            console.log(e);
        }
    })();
}
function users(user_sess) {
    //users
    (async () => {
        try {
            const  users = await rpc2.get_table_rows({
                code: contract_code,
                table: 'users',
                scope: contract_scope,
                // upper_bound: user_sess
            });
            var s=users.rows;
            for ( var i = 0; i <s.length; i++){
                if(s[i]['account']==user_sess){
                    $("#mining_income").html(s[i]['mining_income']);
                    $("#user_reward").html(s[i]['reward']);
                    // console.log('5623:'+s[i]['t_code']);
                    if(s[i]['t_code'] > 0 ){
                        $("#user_t_code").html(user_sess+'');
                        var node_link=location.protocol +'//'+ location.host+'?memo='+user_sess+"";
                        $("#node_link").html(node_link);
                        $(".user_t_code_show").show();
                    }else if(s[i]['t_code'] <= 0 ){
                        $("#user_t_code").html('0');
                        $(".user_t_code_show").hide();
                    }
                    if(s[i]['t_code']==1){
                        $("#user_node_config").html(vm.languageCon.high_node );
                    }
                    if(s[i]['t_code']==2){
                        $("#user_node_config").html(vm.languageCon.midd_node );
                    }
                    if(s[i]['t_code']==3){
                        $("#user_node_config").html(vm.languageCon.basic_node );
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    })();
}



function GetRequest() {
    var url = location.search;
    var theRequest = new Object();
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        strs = str.split("&");
        for(var i = 0; i < strs.length; i ++) {
            theRequest[strs[i].split("=")[0]]=unescape(strs[i].split("=")[1]);
        }
    }
    return theRequest;
}
function setUserloginInfo() {
    var user_sess=getSession('user');

    //users
    (async () => {
        try {
            const  users = await rpc2.get_table_rows({
            code: contract_code,
            table: 'users',
            scope: contract_scope,
            // upper_bound: user_sess
        });
    var user_login_status='';
    var s=users.rows;
    for ( var i = 0; i <s.length; i++){
        if(s[i]['account'] == user_sess){
            user_login_status='is_login';
        }
    }
    if(user_login_status=='is_login'){
        login_suc(user_sess)
    }else{
        login_err();
    }
} catch (e) {
        console.log(e);
    }
})();
}
function loginVerification() {
    var client_type=IsPC();
    if(client_type){
        scatter_status();
        setUserloginInfo();
    }else{
        setUserloginInfo();
    }

}
$("#tran_address").val(contract_code);

function load_index() {
    rounds1();
    expcinfo2();
    nodetype3();
    stat_supply();
    mature_quantity();
    loginVerification();
}
function login_suc(user_sess) {
    accounts(user_sess);
    users(user_sess);
    accountsm(user_sess);
    $("#btn_tran").show();
    $("#btn_login").hide();
    $("#login_username").html(user_sess);
    $(".user_is_login_show").show();
}
function login_err(user_sess='') {
    scatter_logout();
    $("#login_input").val('');
    setSession('user','');
    $("#login_username").html(vm.languageCon.no_login);
    $(".user_is_login_show").hide();
    $("#btn_login").show();
    $("#btn_tran").hide();
}
// console.log(user_list);
// console.log(user_list.includes('playerworld1'));
function login() {
    var login_input = $("#login_input").val();
    // console.log('login_input',login_input);
    if(login_input==''){
        layer.open({
            content: vm.languageCon.enter_username,
            skin: 'msg',
            time: 3
        });
        return false;
    }
    // console.log(user_list);
    setSession('user',login_input);
    // console.log(user_list.includes('playerworld1'));
    $("#alert_login").hide();
    // loginVerification();
    (async () => {
        try {
            const  users = await rpc2.get_table_rows({
                code: contract_code,
                table: 'users',
                scope: contract_scope,
            });
            var user_login_status='';
            var s=users.rows;
            // console.log(s);
            // console.log('login_input',login_input);

            for ( var i = 0; i <s.length; i++){
                if(s[i]['account'] == login_input){
                    // console.log(s[i]['account']);
                    user_login_status='is_login';
                }
            }
            // console.log(user_login_status);
            if(user_login_status=='is_login'){
                login_suc(login_input)
            }else{
                layer.open({
                    content: vm.languageCon.account_not,
                    skin: 'msg',
                    time: 3
                });
                login_err();
            }
        } catch (e) {
            console.log(e);
        }
    })();
}
function alert_hide(d) {
    $("#alert_"+d).hide();
}
function alert_show(d) {
    $("#eos_price").val('');
    $("#alert_"+d).show();
}
function getSession(key) {
    return sessionStorage.getItem(key);
}
function setSession(key,value) {
    return sessionStorage.setItem(key,value);
}
function rounds1_data(r) {
    // console.log(r);
    var html ='';
    var data=r.rows;
    var total_quantity=0;
    var current_quantity=0;
    for ( var i = 0; i <data.length; i++){
        total_quantity=Number(data[i]['total_quantity']) + total_quantity;
        current_quantity=Number(data[i]['current_quantity']) + current_quantity;
        // console.log(total_quantity);
        html+=investment(data[i]);
    }
    // console.log(total_quantity);
    // console.log(current_quantity);
    $("#total_quantity").html(total_quantity/100000000);
    $("#current_quantity").html(current_quantity/100000000);
    $("#investment_list").html(html);
}
// console.log();

function nodetype3_data(data) {
    // console.log(data);
    var s=data.rows;
    var html='';
    // console.log(s[0]['t_name']);

    for ( var i = 0; i <s.length; i++){
        var eos_price= s[i]['eos_price'];
        var high='';
        if(s[i]['t_name']=='high'){
            high=vm.languageCon.high_node + vm.languageCon.node;
        }
        if(s[i]['t_name']=='midd'){
            high=vm.languageCon.midd_node + vm.languageCon.node;
        }
        if(s[i]['t_name']=='basic'){
            high=vm.languageCon.basic_node + vm.languageCon.node;
        }
        html+='<li data-price="'+eos_price+'" onclick="nodetype3_one(\''+eos_price+'\')"><b class="font-14">'+high+'</b><br><span class="font-10">'+eos_price+'</span></li>';
    }

    $(".nodetype3").html(html);
    scatter_status();
}
function nodetype3_one(eos_price) {
    alert_show('tran');
    $("#eos_price").val(eos_price);
}
function timeFormat(d) {
    var da = Date.parse(d);
    da = new Date(da);
    var year = da.getFullYear()+'';
    var month = da.getMonth()+1+'';
    var date = da.getDate()+'';
    return [year,month,date].join('-');
}
function getTimestamp(d) {
    return new Date(d).getTime() / 1000;
}
function currTimestamp() {
    return Date.parse(new Date()) / 1000;
}
function SecondToDate(msd) {

}
var t1 = window.setTimeout(hello,1000);
function hello() {
    console.log(currTimestamp());
}
setInterval("time_show_down()","1000");
function time_show_down(){
    var currtime_stamp=currTimestamp();
    var end_time_stamp=getSession('end_time_stamp');
    var time=(end_time_stamp-currtime_stamp);
    // console.log(time);
    var str=vm.languageCon.count_down + transTime(time);
    $("#SecondToDate").html(str);
}
function transTime(timestamp) {
    var result = "";
    if (timestamp >= 86400) {
        $days = Math.floor(timestamp / 86400);
        timestamp = timestamp % 86400;
        result = $days + vm.languageCon.day;
        if (timestamp > 0) {
            result += '';
        }
    }
    if (timestamp >= 3600) {
        $hours = Math.floor(timestamp / 3600);
        timestamp = timestamp % 3600;
        if ($hours < 10) {
            $hours = '0' + $hours;
        }
        result += $hours + vm.languageCon.hour;
    }
    if (timestamp >= 60) {
        $minutes = Math.floor(timestamp / 60);
        timestamp = timestamp % 60;
        if ($minutes < 10) {
            $minutes = '0' + $minutes;
        }
        result += $minutes + vm.languageCon.minute;
    }
    $secend = Math.floor(timestamp);
    if ($secend < 10) {
        $secend = '0' + $secend;
    }
    result += '<span style="color:#fe566a">'+$secend + vm.languageCon.second+'</span>';
    return result;
}

function investment(data){
    var classs='';
    // var s = parseInt(data.start_time.getTime()/1000);
    var start_time = data.start_time;
    var end_time = data.end_time;
    var start_time_stamp=getTimestamp(start_time);
    var end_time_stamp=getTimestamp(end_time);
    var currtime_stamp=currTimestamp();
    if(currtime_stamp > start_time_stamp && currtime_stamp < end_time_stamp){
        classs='first';
        setSession('end_time_stamp',end_time_stamp);
    }
    var sort=data.sort+1;
    var start_price_usdt=decimal(data.start_price_usdt,4);
    return '<li class="'+classs+' " style="">'+
        '<div class="li li-1 white" style="">'+vm.languageCon.the_first+ '<br>'  + sort + '<br>' + vm.languageCon.round +'</div>' +
        '<div class="li li-2"><div class="top">' +
        '<div class="left text-center ">' +
        '<span class="blue font-14">'+data.current_quantity+' EXPC</span>' +
        '<br><span>'+vm.languageCon.residual+'</span></div>' +
        '<div class="right text-center">' +
        '<span class="font-20 orange">'+start_price_usdt+' USDT</span>' +
        '<br><span>'+vm.languageCon.price+'</span></div></div>' +
        '<div class="bottom"> <span>'+vm.languageCon.start_time+'：<font class="white">'+timeFormat(start_time)+'</font> ' +
        '</span><span>'+vm.languageCon.end_time+'：<font class="white">'+timeFormat(end_time)+'</font>' +
        '</span></div></div></li>';
}
white_paper();
function white_paper() {
    var pdf = location.protocol +'//'+ location.host+'/pdf/payc.pdf';
    $("#white_paper").attr('href',pdf);
}


function copy_text(id){
    var text = $("#"+id).val();
    if(text==''){
        text = $("#"+id).html();
    }
    console.log(text);
    copyText(text);
    layer.open({
        content: vm.languageCon.copy_msg,
        skin: 'msg',
        time: 2
    });
}

function copyText(text, callback){
    var tag = document.createElement('input');
    tag.setAttribute('id', 'cp_hgz_input');
    tag.value = text;
    document.getElementsByTagName('body')[0].appendChild(tag);
    document.getElementById('cp_hgz_input').select();
    document.execCommand('copy');
    document.getElementById('cp_hgz_input').remove();
    // if(callback) {callback(text)}
}

var dom = document.getElementById("container");
var myChart = echarts.init(dom);
option = null;

option = {
    tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    series: [
        {
            type:'pie',
            radius: ['70%', '80%'],
            avoidLabelOverlap: false,
            label: {
                normal: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    show: false,
                    textStyle: {
                        fontSize: '0',
                        fontWeight: 'bold'
                    }
                }
            },
            color:['#22ce8b','#f35b6a','#ffcd54','#006eff'],
            labelLine: {
                normal: {
                    show: false
                }
            },
            data:[
                {value:35, name:vm.languageCon.excavation},
                {value:65, name:vm.languageCon.quantity_mining},
            ]
        }
    ]
};
;
if (option && typeof option === "object") {
    myChart.setOption(option, true);
}
t = window.setInterval("writeTip()",2000);
function writeTip() {
    layer.closeAll()
}
