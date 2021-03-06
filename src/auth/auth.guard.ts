import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { AllowedRoles } from 'src/auth/role.decorator';
import { JwtService } from 'src/jwt/jwt.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.get<AllowedRoles>(
      'roles',
      context.getHandler(),
    );
    if (!roles) {
      return true;
    }
    const graphqlContext = GqlExecutionContext.create(context).getContext();
    const { token } = graphqlContext;
    if (!token) {
      return false;
    }
    const decoded = this.jwtService.verify(token.toString());
    if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
      const { user } = await this.userService.findById(decoded['id']);
      if (!user) {
        return false;
      }
      graphqlContext['user'] = user;
      if (roles.includes('Any')) {
        return true;
      }
      return roles.includes(user.role);
    }
  }
}
