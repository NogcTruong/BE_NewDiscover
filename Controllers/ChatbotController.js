const OpenAI = require("openai");
const ChatLog = require("../models/ChatLog");
const dotenv = require("dotenv");
dotenv.config();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ChatbotController = {
  async generateResponse(req, res) {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({
          type: "error",
          message: "Message is required",
        });
      }
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `Given a question about tourism in Da Nang City, Viet Nam, you will respond in Vietnamese, addressing advice, location, or ratings,
              something should do, should not do, you can give some recommendations, some information and list only the first five records if applicable.
              Don't use any other language. If the question is general, reply: "Tôi là trợ lý về du lịch. Bạn có thể hỏi tôi về địa điểm, lời khuyên, hoặc các gợi ý du lịch tại Việt Nam."
              If the question is not relevant, reply: "Xin lỗi, tôi không thể trả lời câu hỏi này."
              If question is about a recommendation,  add "Đây là những địa điểm có lượt đánh giá cao. Tôi nghĩ nó sẽ phù hợp với bạn." at the end of answer,
              else if is about food, add "Đồ ăn ở đây nổi tiếng với sự tươi mới nhưng còn tuỳ khẩu vị của bạn",
              else if is about vehicle, add "Tuỳ chỗ sẽ cấm các phương tiện số sàn tự động (xe tay ga) hãy chú ý nhé",
              about places to swim or go to amusement parks, warn them that if swimming, they should go to a protected place... or a place that is guaranteed to be safe. As for the playground, you should pay attention to the age of the children,
              if about compare, answer include the place have higher rate with comment "có lượt đánh giá cao, Nhưng tuỳ vào sở thích thì sẽ mang lại trải nghiệm khác nhau, người dùng có thể đến trải nghiệm và  để lại đánh giá nhận xét"`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.8,
        max_tokens: 1354,
        stream: true,
      });
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
      });
      let response = "";
      for await (const chunk of completion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          response += content;
          res.write(content);
        }
      }
      res.end();

      await ChatLog.create({
        userId: req.user.id,
        question: message,
        answer: response,
      });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({
        type: "error",
        message: "An error occurred while processing your request",
        error: error.message,
      });
    }
  },
};

module.exports = ChatbotController;
