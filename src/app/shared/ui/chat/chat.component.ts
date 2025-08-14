import { Component, Input, OnDestroy } from '@angular/core';
import { Database, ref, push, onValue, Unsubscribe } from '@angular/fire/database';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnDestroy {
  @Input() gameId!: string;
  messages: any[] = [];
  newMessage = '';
  senderId = Math.random().toString(36).substring(2, 15); // Изменено на public
  private chatUnsubscribe: Unsubscribe | null = null;

  constructor(private db: Database) {}

  ngOnInit() {
    this.loadMessages();
  }

  ngOnDestroy() {
    if (this.chatUnsubscribe) {
      this.chatUnsubscribe();
    }
  }
  private scrollToBottom() {
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }, 0);
  }
  
  // Обновите методы loadMessages и sendMessage:
  loadMessages() {
    const chatRef = ref(this.db, `games/${this.gameId}/chat`);
    this.chatUnsubscribe = onValue(chatRef, (snapshot) => {
      const messages = snapshot.val() || {};
      this.messages = Object.values(messages).sort((a: any, b: any) => a.timestamp - b.timestamp);
      this.scrollToBottom(); // Автопрокрутка при загрузке сообщений
    });
  }
  
  async sendMessage() {
    if (!this.newMessage.trim()) return;
  
    const message = {
      senderId: this.senderId,
      text: this.newMessage,
      timestamp: Date.now()
    };
  
    const chatRef = ref(this.db, `games/${this.gameId}/chat`);
    await push(chatRef, message);
    this.newMessage = '';
    this.scrollToBottom(); // Автопрокрутка после отправки
  }
}