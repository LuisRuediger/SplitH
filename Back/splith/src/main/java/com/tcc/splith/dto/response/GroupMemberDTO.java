package com.tcc.splith.dto.response;

import com.tcc.splith.entity.GroupMember;
import com.tcc.splith.entity.GroupRole;

public record GroupMemberDTO(Long id, String name, String email, GroupRole role) {
    public static GroupMemberDTO from(GroupMember gm) {
        return new GroupMemberDTO(
                gm.getUser().getId(),
                gm.getUser().getName(),
                gm.getUser().getEmail(),
                gm.getRole()
        );
    }
}
