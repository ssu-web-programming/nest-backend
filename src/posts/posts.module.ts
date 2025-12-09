// src/posts/posts.module.ts (수정)

import { Module, forwardRef } from '@nestjs/common'; // ✨ forwardRef 임포트
import { MongooseModule } from '@nestjs/mongoose';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post, PostSchema } from './schemas/post.schema';
import { AuthModule } from '../auth/auth.module';
import { Types } from 'mongoose';
import { PostOwnerGuard } from './guards/post-owner.guard'; // ✨ PostOwnerGuard 임포트 추가

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
    // ✨ AuthModule에 forwardRef() 적용
    forwardRef(() => AuthModule), 
  ],
  controllers: [PostsController],
  providers: [PostsService, PostOwnerGuard],
  // 만약 PostsService가 다른 모듈에서 사용된다면 exports에도 추가해야 합니다.
  exports: [PostsService], 
})
export class PostsModule {}

// 그리고 필요하다면 AuthModule에서도 PostsModule을 임포트하는 부분에 forwardRef()를 적용해야 합니다.