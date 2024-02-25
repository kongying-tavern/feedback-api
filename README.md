# Kongying Tavern Pin Feedback API

空荧酒馆点位反馈API，对接飞书。支持 Serverless

> 文档由 ChatGPT 生成，如果看不懂的话就直接看代码吧~ 就两个接口啦 (〃￣︶￣)人

**Base URL**: `/`
**TEST_SERVE**: <https://kongying-tavern-pin-feedback-api.vercel.app/>

---

### Authenticate

从请求头中获取授权令牌 authorization
令牌格式为 `timestamp:hashedTimestamp`，其中 timestamp 是时间戳，hashedTimestamp 是时间戳与盐值(yuanshen.site)哈希后的值。

#### Get Root

- **URL**: `/`
- **Method**: `GET`
- **Description**: Get Kongying Tavern Pin Feedback API information.
- **Response**:
  - **Code**: `200`
  - **Body**:
    ```json
    {
      "code": "200",
      "message": "Kongying Tavern Pin Feedback Api"
    }
    ```

---

#### Upload Image

- **URL**: `/upload`
- **Method**: `POST`
- **Description**: Upload an image.
- **Limit**: file size less 3MB
- **Request Body**:
  - Form Data:
    - `file`: Image file (JPEG, PNG, GIF)
- **Response**:
  - **Code**: `200`
  - **Body**:
    ```json
    {
      "message": "success",
      "code": 200,
      "data": {
        "file_token": "<file_token>"
      }
    }
    ```
- **Error Response**:
  - **Code**: `400`
  - **Body**:
    ```json
    {
      "message": "No file was uploaded.",
      "code": 400
    }
    ```
  - **Code**: `506`
  - **Body**:
    ```json
    {
      "message": "<error_message>",
      "code": "<error_code>"
    }
    ```

---

#### Search Records

- **URL**: `/records/search`
- **Method**: `POST`
- **Description**: Search records. *(TODO)*

---

#### Add Record

- **URL**: `/records/add`
- **Method**: `POST`
- **Description**: Add a record.
- **Request Body**:
  - JSON Object:
    - `content` (String, Required): Content of the record.
    - `user_id` (String, optional): User ID.
    - `tickname` (String, optional): User nickname.
    - `platform` (String, optional): Platform.
    - `feedback_classify` (Array of Strings, optional): Feedback classify.
    - `feedback_type` (String, optional): Feedback type.
    - `file` (Array of Objects, optional): File attachments.
    - `user_env_info` (String, optional): User environment information.
    - `pin_id` (String, optional): Pin ID.
    - `pin_creator_id` (String, optional): Pin creator ID.
    - `user_platform` (String, optional): User platform.
- **Response**:
  - **Code**: `200`
  - **Body**:
    ```json
    {
      "message": "success",
      "code": 200,
      "data": {
        "id": "<id>",
        "feedback_id": "<feedback_id>",
        "record_id": "<record_id>"
      }
    }
    ```
- **Error Response**:
  - **Code**: `500`
  - **Body**:
    ```json
    {
      "code": "<error_code>",
      "message": "<error_message>"
    }
    ```

Request Body Example

```json 
{
    "content": "我是反馈内容",
    "user_id": "test-123",
    "tickname": "Test",
    "platform": "Test",
    "feedback_classify": [
        "Deafult"
    ],
    "file": [
      {
        "file_token": "" // 通过 upload 接口获取
      }
    ],
    "user_env_info": "123",
    "pin_id": "123",
    "pin_creator_id": "1",
    "user_platform": "Windows",
    "feedback_type": "提缺陷"
}
```
