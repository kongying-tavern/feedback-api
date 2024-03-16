# Kongying Tavern Pin Feedback API

空荧酒馆点位反馈API，对接飞书。支持 Serverless

- **Base URL**: `/apis/v1`
- **TEST_SERVE**: <https://kongying-tavern-pin-feedback-api.vercel.app/>

---

## State

W.I.P.


### Authenticate

从请求头中获取授权令牌 authorization
令牌格式为 `timestamp:hashedTimestamp`，其中 timestamp 是时间戳，hashedTimestamp 是时间戳与盐值(site.yuanshen)哈希后的值。
