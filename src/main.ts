import * as https from 'https';
import * as querystring from 'querystring';
import md5 = require('md5');
import {appSecret,appId} from './privte';

type ErrorMap={
    [k:string]:string
}
const errorMap:ErrorMap={
    52003:'访问频率受限 ',
    54004:'账户余额不足',
    54005:'长query请求频繁 ',
    unknown:'服务器繁忙',
    52001:'请求超时',
    52002:'系统错误',
    54000:'必填参数为空',
    54001:'签名错误',
    58001:'译文语言方向不支持',
    58002:'服务当前已关闭',

}
export const translate=(word:string)=>{
    let from,to
    if(/[a-zA-Z]/.test(word[0])){
        //英译中
        from='en'
        to='zh'
    }else {
        //中译英
        from='zh'
        to='en'
    }
    const salt=Math.random()
    const sign=md5(appId+word+salt+appSecret)
    const query= querystring.stringify({q:word, appid:appId,from,to,salt,sign})

    const options = {
        hostname: 'api.fanyi.baidu.com',
        port: 443,
        path: '/api/trans/vip/translate?'+query,
        method: 'GET'
    };

    const request = https.request(options, (request) => {
        let chunks:Buffer[]=[]
        request.on('data', (chunk) => {
            chunks.push(chunk)
        });
        request.on('end',()=>{
            type BaiduResult={
                error_code:string,
                error_msg:string,
                from:string,
                to:string,
                trans_result:
                    {
                        dst:string,
                        src:string
                    }[]

            }
            const string= Buffer.concat(chunks).toString();
            const object:BaiduResult=JSON.parse(string)
            if(object.error_code in errorMap){
                console.error( errorMap[object.error_code]|| object.error_msg)
                process.exit(2)
            }else {
                object.trans_result.map(i=>{
                    console.log(i.dst)
                })
                process.exit(0)
            }
        })
    });

    request.on('error', (error) => {
        console.error(error);
    });
    request.end();
}