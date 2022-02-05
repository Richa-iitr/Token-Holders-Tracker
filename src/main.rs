use ethcontract::transaction::Account;
use std::time::Duration;
use web3::api::Web3;
use web3::Transport;
use web3::types::*;
use ordered_map::OrderedMap;
use std::str::FromStr;
use serde::Deserialize;
use serde_json::Number;
use reqwest::Error;
use math::round;
use std::env;
use contract_address::{
	Address, U256, ContractAddress
};
use web3::transports::Http;
use std::collections::HashMap;
use hex_literal::hex;
use std::time;
use web3::{
    contract::{Contract, Options},
    futures::{future,StreamExt},
    types::FilterBuilder,
};
use core::fmt::Write;

#[macro_use]
extern crate log;
extern crate env_logger;
extern crate hex_literal;
// static mut web3: ethcontract::Web3<dyn Transport> = web3::Web3::new(web3::transports::Http::new("http://127.0.0.1:8545"));


#[tokio::main]
async fn main() -> web3::contract::Result<()> {
    dotenv::dotenv().ok();
    let _ = env_logger::try_init();
    

    let events: Vec<Log> = Vec::new();
    web3 = web3::Web3::new(web3::transports::Http::new("http://127.0.0.1:8545")?);
    let mut accounts = HashMap::<H256, U256>::new();
    
    let latest_block = web3.eth().block(BlockId::Number(BlockNumber::Latest)).await.unwrap().unwrap();
    let bn:u64 = (latest_block.number.unwrap());
    getEvents(0, bn);


    async fn getEvents(start: u64, end: u64) -> Result<(), web3::contract::Error>  {
        let contract_addr = Address::from_str("0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb").unwrap();

        let num: u64 = end - start + 1;
        if num>10000 {

            let mid: u64 = ((start+end)/2);
            getEvents(start, mid);
            getEvents(mid+1, end);
        }

        let filter = FilterBuilder::default()
            .from_block(BlockNumber::from(start))
            .to_block(BlockNumber::from(end))
            .address(vec![contract_addr])
            .topics(
                Some(vec![hex!(
                    "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
                )
                .into()]),
                None,
                None,
                None,
            )
            .build();

        let mut result: Vec<Log> = web3.eth().logs(filter).await?;
        events.append(&mut result);
            Ok(())
    }

    for log in events{
        println!("{:#?}", log);

        let value:U256 = U256::from(log.data);
        let from: H256 = log.topics[1];
        let to: H256 = log.topics[2];

        accounts[&from] -= value;

        if accounts.contains_key(&to) {
            accounts[&to] += value;
        } else {
            accounts.insert(to, value);
        }              
    }

    let mut topholders: Vec<(&H256, &U256)> = accounts.iter().collect();
    topholders.sort_by(|a,b| b.1.cmp(a.1));

    let count = 0;
    for holder in topholders {
        println!("{} / {}", holder.0, holder.1);
        count += 1;
        if count >= 15 {
            break;
        }
    }
    Ok(())

}





// let contract_addr = Address::from_str("0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb").unwrap();

    // let filter = FilterBuilder::default()
    //     .from_block(start)
    //     .to_block(end)
    //     .address(vec![contract_addr])
    //     .topics(
    //         Some(vec![hex!(
    //             "ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
    //         )
    //         .into()]),
    //         None,
    //         None,
    //         None,
    //     )
    //     .build();

    // let result: Vec<Log> = web3.eth().logs(filter).await?;





// let accounts = web3.eth().accounts().await?;
// let websocket = web3::transports::WebSocket::new(&env::var("INFURA_RINKEBY").unwrap()).await?;
// let web3s = web3::Web3::new(websocket);
 // let output_jn= response.to_string();
        // let users = serde_json::from_str::<Obj>(&output_jn).unwrap();
        // for user in users.holders {
        //     println!("{:#?}", user);
        // }
        // Ok(())
//---------------------------------
    // let request_url = format!("https://api.ethplorer.io/getTopTokenHolders/0x6f40d4A6237C257fff2dB00FA0510DeEECd303eb?apiKey=EK-3WYvv-iThWqAS-JqJYC&limit=15");
    // println!("{}", request_url);
    // let response = reqwest::get(&request_url).await?;

    // // let users: Vec<User> = response.json().await?;
    // let users= response.json().await?;
    // println!("{:?}", users);
    // Ok(())
// }
