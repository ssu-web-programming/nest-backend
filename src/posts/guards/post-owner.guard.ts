// src/posts/guards/post-owner.guard.ts

import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsService } from '../posts.service';
import { Types } from 'mongoose';

@Injectable()
export class PostOwnerGuard implements CanActivate {
  constructor(private postsService: PostsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user; 
    const postId = request.params.id; 

    if (!user || !postId || !user._id) {
      throw new ForbiddenException('인증 정보 또는 게시글 ID가 유효하지 않습니다.');
    }

    try {
      // 1. PostsService의 findOne으로 게시글을 가져옵니다. 
      //    (PostsService에서 NotFoundException을 던지도록 구현했으므로, 
      //    post는 null이 아니거나 예외가 던져집니다.)
      const post = await this.postsService.findOne(postId);

      // 2. ✨ [핵심 수정] post 객체가 null일 가능성에 대비한 방어 코드 (TypeScript 타입 안정성 확보)
      if (!post) {
        throw new NotFoundException('해당 게시글을 찾을 수 없습니다.');
      }
      
      // 3. 소유권 비교: JWT 사용자 ID와 게시글 작성자 ID 비교
      const isOwner = post.userId.toString() === new Types.ObjectId(user._id).toString();

      if (!isOwner) {
        throw new ForbiddenException('게시글 소유자만 해당 작업을 수행할 수 있습니다.');
      }

      return true; // 소유자일 경우 접근 허용

    } catch (error) {
        // PostsService.findOne에서 던져진 NotFoundException을 그대로 던집니다.
        if (error instanceof NotFoundException || error instanceof ForbiddenException) {
            throw error;
        }
        // 기타 예상치 못한 오류 발생 시 500으로 처리
        throw new ForbiddenException('요청 처리 중 오류가 발생했습니다.');
    }
  }
}