


// mainnet
var chainId = 'e70aaab8997e1dfce58fbfac80cbbb8fecec7b99cf982a9444273cbc64c41473';
var endpoint = 'https://nodes.get-scatter.com';

// kylin
// var chainId = '5fff1dae8dc8e2fc4d5b23b2c7665c97f9e9d8edf2b6485a86ba311c25639191';
// var endpoint = 'https://api-kylin.eosasia.one';

var eos = Eos({
    keyProvider: '',
    httpEndpoint: endpoint,
    chainId: chainId,
});

var network2 = null;
var identity = null;
var currentAccount = null;

function checkoutNetworks() {
    var httpEndpoint = endpoint.split('://');
    var host = httpEndpoint[1].split(':');

    network2 = {
        blockchain: 'eos',
        host: host[0],
        port: host.length > 1 ? host[0] : (httpEndpoint[0].toLowerCase() == 'https' ? 443 : 80),
        chainId: chainId,
        protocol: httpEndpoint[0],
        httpEndpoint : endpoint,
    };

    console.log(`网络参数：${JSON.stringify(network2)}`);
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
            console.log(`检查账号出错：${JSON.stringify(err)}`);
            // setTimeout(checkAccount, 1000);
        });
    } catch (error) {
        console.log(`检查账号出错：${JSON.stringify(error)}`);
        // setTimeout(checkAccount, 1000);
    }
}

function scatter_open(successCallback, errorCallbak) {
    let that = this;
    if (!hasScatter()) {
        errorCallbak("scatter required");
        return;
    }
    checkoutNetworks();
    scatter.suggestNetwork(network2).then(() => {
        const requirements = { accounts: [network2] };
        scatter.getIdentity(requirements).then(
            function (i) {
                if (!i) {
                    return errorCallbak(null);
                }
                identity = i;
                currentAccount = identity.accounts[0];
                console.log(identity.accounts[0].name);
                // eos = scatter.eos(network, Eos, { expireInSeconds: 60 }, "https");
                successCallback();
            }
        ).catch(error => {
            errorCallbak(error);
        });
    }).catch(error => {
        errorCallbak(error);
    });
}



function scatter_logout() {
    if (identity) {
        identity = null;
        if (hasScatter()) {
            scatter.forgetIdentity().then(() => {
                console.log('logout success');
            });
        }
    }
}

// 清理之前已登录的 identity
function cleanscatter() {
    if (hasScatter()) {
        scatter.connect('SAMPLE').then(connected => {
            scatter.forgetIdentity().then(() => {
                console.log('logout success');
            });
        });
    }
}
function scatter_login() {
    if (!hasScatter()) {
        alert('scatter required');
        return;
    }
    scatter.connect('SAMPLE').then(connected => {
        open(function () {
            alert(`登陆成功：${JSON.stringify(identity)}`);
            console.log(`登陆成功：${JSON.stringify(identity)}`);
            checkAccount();
        }, function (error) {
            console.log(`登陆出错：${JSON.stringify(error)}，请关闭重新打开或者刷新本页面`);
        });
    });
}
console.log(scatter);
// 转账
function transfer(){
    scatter_login();
    if (currentAccount == null) {
        alert('请先登录');
    }

    var eos = scatter.eos(network2, Eos);

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
                    to: 'giveeostoken',
                    quantity: '0.0001 EOS',
                    memo: 'scatter 转账测试'
                }
            }
        ]
    }).then(result => {
        alert('success!');
    }).catch(error => {
        alert('error:'+JSON.stringify(error));
    });

}

// airgrab way1 - eos.transaction - 推荐方式
function airgrab(){
    if (currentAccount == null) {
        alert('请先登录');
    }

    var eos = scatter.eos(network, Eos);

    eos.transaction({
        actions: [
            {
                account: 'medisharesbp',
                name:    'signup',
                authorization: [{
                    actor:      currentAccount.name,
                    permission: currentAccount.authority
                }],
                data: {
                    owner:    currentAccount.name,
                    quantity: '0.0000 EMDS'
                }
            }
        ]
    }).then(result => {
        alert('success!');
    }).catch(error => {
        alert('error:'+JSON.stringify(error));
    });
}

// airgrab way2 - eos.contract
function airgrab2(){
    if (currentAccount == null) {
        alert('请先登录');
    }

    var eos = scatter.eos(network, Eos);

    eos.contract("medisharesbp").then(contr => {
        contr.signup(currentAccount.name, '0.0000 EMDS', {
            authorization: [currentAccount.name]
        }).then(result => {
            console.log(result);
        });
    });
}