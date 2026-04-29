package com.tcc.splith.dto.response;

import com.tcc.splith.entity.Group;

import java.util.List;

public record GroupDTO(Long id, String name, String description, List<GroupMemberDTO> members) {
    public static GroupDTO from(Group group, List<GroupMemberDTO> members) {
        return new GroupDTO(group.getId(), group.getName(), group.getDescription(), members);
    }
}
